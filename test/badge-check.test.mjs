import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLogin, parseVisibleAchievements, summarizeStars, checkProfile } from "../badge-check.mjs";

test("profile input rejects other hosts and paths before any request", () => {
  assert.equal(normalizeLogin("https://github.com/eCoxvague/"), "eCoxvague");
  assert.equal(normalizeLogin("@eCoxvague"), "eCoxvague");
  assert.throws(() => normalizeLogin("https://github.com.example/eCoxvague"));
  assert.throws(() => normalizeLogin("https://github.com/eCoxvague/repository"));
});

test("visible badges deduplicate mobile/sidebar copies without counting avatars", () => {
  const html = '<img alt="avatar"><img alt="Achievement: Pull Shark" src="/pull-shark-bronze-test.png">' +
    "<img src='/pull-shark-bronze-test.png' alt='Achievement: Pull Shark'>" +
    '<img src="/yolo-default-test.png" alt="Achievement: YOLO">';
  assert.deepEqual(parseVisibleAchievements(html), [
    { name: "Pull Shark", tier: "bronze" }, { name: "YOLO", tier: "default" },
  ]);
});

test("fork and private stars cannot inflate the original public repository milestone", () => {
  const repos = [
    { fork: true, stargazers_count: 5000 },
    { private: true, fork: false, stargazers_count: 100 },
    { full_name: "owner/original", html_url: "https://github.com/owner/original", fork: false, private: false, stargazers_count: 12 },
  ];
  const result = summarizeStars(repos);
  assert.equal(result.ownPublicRepositories, 1);
  assert.equal(result.repository.starsToNextMilestone, 4);
  assert.equal(summarizeStars([{ ...repos[2], stargazers_count: 16 }]).repository.nextCommunityReportedMilestone, 128);
  assert.equal(summarizeStars([{ ...repos[2], stargazers_count: 4096 }]).repository.nextCommunityReportedMilestone, null);
});

const badgeHtml = '<img src="/yolo-default-test.png" alt="Achievement: YOLO">';
function fakeGitHub({ limit = false, html = badgeHtml } = {}) {
  const calls = [];
  return {
    calls,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (url.includes("/repos?")) return new Response(JSON.stringify([]), {
        headers: { "content-type": "application/json", ...(limit ? { link: '<https://api.github.com/next>; rel="next"' } : {}) },
      });
      if (url.startsWith("https://api.github.com/")) return Response.json({ login: "eCoxvague", type: "User" });
      return new Response(html);
    },
  };
}

test("request boundary uses only the public API/profile and never forwards credentials", async () => {
  const client = fakeGitHub();
  const report = await checkProfile("eCoxvague", client);
  assert.equal(report.publicRepositoryReadComplete, true);
  assert.equal(report.visibleAchievements[0].name, "YOLO");
  assert.equal(client.calls.length, 3);
  for (const call of client.calls) {
    assert.ok(["api.github.com", "github.com"].includes(new URL(call.url).hostname));
    assert.equal(call.options.headers.Authorization, undefined);
  }
});

test("pagination cap is reported as partial instead of a complete inventory", async () => {
  const report = await checkProfile("eCoxvague", { ...fakeGitHub({ limit: true }), maxPages: 1 });
  assert.equal(report.publicRepositoryReadComplete, false);
});

test("rate limits fail rather than inventing an empty report", async () => {
  await assert.rejects(checkProfile("eCoxvague", { fetchImpl: async () => new Response("", { status: 403 }) }), /access\/rate limit/);
});

test("missing HTML badges are treated as hidden/unknown rather than absent achievements", async () => {
  await assert.rejects(checkProfile("eCoxvague", fakeGitHub({ html: "<h1>Profile</h1>" })), /may be hidden/);
});
