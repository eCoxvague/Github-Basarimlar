import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const API = "https://api.github.com";
const WEB = "https://github.com";
const STAR_MILESTONES = [16, 128, 512, 4096];

export function normalizeLogin(value) {
  const raw = String(value || "").trim();
  let login = raw.replace(/^@/, "");
  if (/^https?:\/\//i.test(raw)) {
    const url = new URL(raw);
    if (url.hostname !== "github.com") throw new Error("Use a github.com profile URL.");
    login = url.pathname.replace(/^\//, "").replace(/\/$/, "");
  }
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(login)) {
    throw new Error("Provide a valid GitHub username or profile URL.");
  }
  return login;
}

export function parseVisibleAchievements(html) {
  const result = new Map();
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const attributes = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attributes[match[1].toLowerCase()] = match[2] ?? match[3];
    }
    const name = attributes.alt?.match(/^Achievement: (.+)$/)?.[1];
    if (!name) continue;
    const tier = attributes.src?.match(/-(default|bronze|silver|gold)(?:-|\.)/)?.[1] || "unknown";
    result.set(name, { name, tier });
  }
  return [...result.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function summarizeStars(repositories) {
  const own = repositories.filter((repo) => !repo.fork && !repo.private);
  const strongest = own.reduce((best, repo) =>
    !best || repo.stargazers_count > best.stargazers_count ? repo : best, null);
  if (!strongest) return { ownPublicRepositories: own.length, repository: null };
  const stars = strongest.stargazers_count;
  const next = STAR_MILESTONES.find((milestone) => milestone > stars) ?? null;
  return {
    ownPublicRepositories: own.length,
    repository: {
      name: strongest.full_name,
      url: strongest.html_url,
      stars,
      nextCommunityReportedMilestone: next,
      starsToNextMilestone: next === null ? null : next - stars,
    },
  };
}

async function read(url, fetchImpl, json = true) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: json ? "application/vnd.github+json" : "text/html",
      "User-Agent": "github-basarim-kontrolu/1.0",
      ...(json ? { "X-GitHub-Api-Version": "2022-11-28" } : {}),
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const limit = response.status === 403 || response.status === 429;
    throw new Error(limit
      ? "GitHub access/rate limit: wait and retry. No result was inferred."
      : "GitHub returned HTTP " + response.status + ".");
  }
  return { data: json ? await response.json() : await response.text(), headers: response.headers };
}

export async function checkProfile(input, { fetchImpl = fetch, maxPages = 10, now = () => new Date() } = {}) {
  const login = normalizeLogin(input);
  if (!Number.isInteger(maxPages) || maxPages < 1) throw new Error("maxPages must be positive.");
  const profileUrl = WEB + "/" + encodeURIComponent(login) + "?tab=achievements";
  const profile = await read(API + "/users/" + encodeURIComponent(login), fetchImpl);
  if (profile.data.type !== "User") throw new Error("Use a personal GitHub account.");
  const repositories = [];
  let complete = false;
  for (let page = 1; page <= maxPages; page++) {
    const response = await read(API + "/users/" + encodeURIComponent(login) +
      "/repos?type=owner&per_page=100&page=" + page, fetchImpl);
    if (!Array.isArray(response.data)) throw new Error("Unexpected repository response.");
    repositories.push(...response.data);
    if (!response.headers.get("link")?.includes('rel="next"')) {
      complete = true;
      break;
    }
  }
  const page = await read(profileUrl, fetchImpl, false);
  const achievements = parseVisibleAchievements(page.data);
  if (!achievements.length) {
    throw new Error("No achievement images could be read. Badges may be hidden or the page format changed; no missing-badge claims were made.");
  }
  return {
    schemaVersion: 1,
    checkedAt: now().toISOString(),
    login: profile.data.login,
    profileUrl,
    visibleAchievements: achievements,
    publicRepositoryReadComplete: complete,
    starProgress: summarizeStars(repositories),
    note: "Public data only. Hidden/private achievements and program membership are not inferred. Milestones are community-reported, not an award guarantee.",
  };
}

function printReport(report) {
  console.log("GitHub: " + report.login);
  console.log("Visible achievements: " + report.visibleAchievements.map((a) => a.name + " [" + a.tier + "]").join(", "));
  console.log("Own public repositories: " + report.starProgress.ownPublicRepositories);
  const repo = report.starProgress.repository;
  if (repo) {
    console.log("Most starred original repository: " + repo.name + " (" + repo.stars + " stars)");
    if (repo.nextCommunityReportedMilestone !== null) {
      console.log("Next community-reported star milestone: " + repo.nextCommunityReportedMilestone +
        " (" + repo.starsToNextMilestone + " more)");
    }
  }
  if (!report.publicRepositoryReadComplete) console.log("Repository scan is partial; the most-starred repository may be outside the scanned pages.");
  console.log(report.note);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const positional = args.filter((arg) => !arg.startsWith("--"));
  if (args.includes("--help") || positional.length !== 1 || args.some((arg) => arg.startsWith("--") && arg !== "--json")) {
    console.log("Usage: node badge-check.mjs <username-or-profile-url> [--json]");
    process.exitCode = args.includes("--help") ? 0 : 1;
  } else {
    try {
      const report = await checkProfile(positional[0]);
      if (args.includes("--json")) console.log(JSON.stringify(report, null, 2));
      else printReport(report);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
