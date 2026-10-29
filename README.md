# GitHub Başarımları ve Görünür Rozet Kontrolü

GitHub profilindeki görünür başarımları ve özgün, herkese açık repoların yıldız durumunu kontrol eden, bağımlılıksız bir Node.js aracı.

## Çalıştırma

Node.js 18 veya üzeri yeterlidir; ek paket ve token gerekmez.

```bash
git clone https://github.com/eCoxvague/Github-Basarimlar.git
cd Github-Basarimlar
npm run check -- eCoxvague
```

Bir profil bağlantısı veya JSON çıktısı da kullanabilirsiniz:

```bash
node badge-check.mjs https://github.com/eCoxvague --json
npm test
```

Araç, herkese açık GitHub REST API'sinden profil ve repo verilerini; GitHub profil sayfasından görünür rozetleri okur. Hesapta değişiklik yapmaz, token istemez ve kullanıcı verisini kaydetmez. Çıktıyı dosyaya yönlendirmek sizin tercihinizdir.

Profil HTML biçimi değişirse, rozetler gizliyse veya erişim sınırlanırsa hata bildirir; eksik veri üzerinden rozet sahibi olmadığınızı iddia etmez. Repo taraması en fazla 10 sayfadır; sınırda kalan sonuçlar kısmi olarak işaretlenir. Yıldız eşikleri topluluk gözlemidir; rozet kazanma garantisi değildir. Fork ve private repo yıldızları Starstruck ilerlemesine katılmaz.

## Rozetler nasıl kazanılır?

GitHub, tüm başarım koşullarını ve eşiklerini eksiksiz bir resmî liste olarak yayımlamıyor. Aşağıdaki sayısal eşikler topluluk gözlemleridir; gerçek kazanımı profilinizden doğrulayın.

| Başarım | Gerçek katkı yolu | Yaygın bildirilen eşikler |
| --- | --- | --- |
| Quickdraw | Yeni bir issue veya PR'ı ilk beş dakika içinde kapatmak | İlk uygun olay |
| YOLO | Kendi PR'ınızı review yapılmadan merge etmek | İlk uygun olay |
| Pull Shark | Açtığınız gerçek PR'ların merge edilmesi | 2 / 16 / 128 / 1024 |
| Pair Extraordinaire | Gerçek ortak katkı içeren co-author commit'inin PR üzerinden merge edilmesi | 1 / 10 / 24 / 48 |
| Galaxy Brain | Repository Discussions içinde başkasının gerçek sorusuna verilen yararlı yanıtın kabul edilmesi | 2 / 8 / 16 / 32 |
| Starstruck | Oluşturduğunuz tek bir reponun yıldız kazanması | 16 / 128 / 512 / 4096 |
| Public Sponsor | GitHub Sponsors üzerinden herkese açık sponsorluk | Ödeme ve uygun görünürlük gerekir |

### YOLO

1. Kendi reponuzda anlamlı bir düzeltme hazırlayın.
2. Yeni branch üzerinde commit oluşturup PR açın.
3. Özellikle fork'ta base ve head repository'nin kendi reponuz olduğunu kontrol edin.
4. Diff'i ve varsa otomatik kontrolleri kontrol edin.
5. Repo kuralları izin veriyorsa review yapılmadan merge edin. Zorunlu review kurallarını rozet için kapatmayın.

Başka birine collaborator yetkisi vermek gerekmez.

### Pair Extraordinaire

Birlikte çalışan gerçek katkıcıların commit mesajında doğru şekilde belirtilmesi gerekir. İkinci kişinin GitHub hesabına bağlı e-posta adresini ve gerçek katkısını kullanın. Sadece PR açıklamasına yazmak yeterli değildir; trailer merge edilen commit mesajında kalmalıdır.

```text
Değişikliğin kısa açıklaması

Co-authored-by: Gerçek Katkıcının Adı <GitHub hesabına bağlı e-posta>
```

### Galaxy Brain

Kabul edilmiş yanıt ile sıradan yorum aynı şey değildir. Gerçek bir repository Discussion sorusunu araştırıp çözüm sunun; kabul kararını soru sahibi veya yetkili maintainer verir. GitHub Community içindeki yorumları bu hedef için güvenilir bir ilerleme sayacı olarak kullanmayın.

## Diğer profil göstergeleri

Bunlar yukarıdaki faaliyet başarımlarından ayrı programlardır:

- **Developer Program Member:** GitHub API kullanan geliştirme veya üretim aşamasında bir entegrasyon ve destek e-postasıyla kayıt. Bu repodaki kontrol aracı gerçek bir API entegrasyonudur; üyelik otomatik verilmez. [Başvuru hazırlığı](docs/DEVELOPER-PROGRAM.md).
- **Pro:** GitHub Pro planı; uygun ve doğrulanmış öğrenciler için Education üzerinden ücretsiz erişim bulunabilir.
- **Security Bug Bounty Hunter:** GitHub güvenlik programında uygun, gerçek bir güvenlik bulgusu.
- **Security advisory credit:** GitHub Advisory Database'e kabul edilen gerçek advisory katkısı.
- **Campus Expert:** İlgili öğrenci programına uygunluk, eğitim ve kabul.
- **GitHub Star:** Topluluk katkılarıyla başkası tarafından aday gösterilme ve GitHub değerlendirmesi; Starstruck ile aynı değildir.

Arctic Code Vault Contributor ve Mars 2020 Contributor geçmiş dönem programlarıdır; yeni bir commit ile geriye dönük katılım sağlanmaz. Heart On Your Sleeve ve Open Sourcerer için doğrulanmış, genel kullanıma açık bir kazanım yolu sunmuyoruz.

## Kaynaklar

- [GitHub profil referansı](https://docs.github.com/en/account-and-profile/reference/profile-reference)
- [GitHub'ın Achievements duyurusu](https://github.blog/news-insights/product-news/introducing-achievements-recognizing-the-many-stages-of-a-developers-coding-journey/)
- [Birden fazla yazarlı commit](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors)
- [Discussions](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions)
- [GitHub Sponsors](https://docs.github.com/en/sponsors/sponsoring-open-source-contributors/about-sponsorships-fees-and-taxes)
- [Developer Program](https://docs.github.com/en/integrations/concepts/github-developer-program)
- [GitHub Stars programı](https://stars.github.com/program)
- [Topluluk eşik rehberi](https://github.com/UfukNode/builder-check/blob/main/Turkce-Rehber.md)

Bu depo, enzifiri/GitHub-Achievements projesinden fork edilmiştir. Önceki rehberin geçmişi Git geçmişinde korunur. Güncel kontrol aracı ve açıklamalar bu fork'ta geliştirilmiştir.
