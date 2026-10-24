# TODO: Lansman ve görünürlük

Teknik SEO hazır: SSR, sitemap, yapısal veri, hreflang, `llms.txt`, robots'ta tüm botlar izinli, paylaşım görselleri. Kalanlar aşağıda.

## Şimdi yapılabilir (ücretsiz, fiyattan bağımsız)

- [x] **Google Search Console**: Eklendi ve sitemap gönderildi (2026-10-24).
- [ ] **Bing Webmaster Tools**: Search Console'dan içe aktarılabilir; sitemap'i orada da gönder. Bing, ChatGPT aramasını da besliyor.
- [ ] **Google Business Profile**: Den Bosch stüdyosu için aç. Doğrulama (posta kartı veya video) zaman alıyor.
- [ ] **Instagram ve Pinterest business hesapları**: Kullanıcı adlarını al.
  - Hesap linkleri → organizasyon verisine `sameAs` olarak eklenecek (`src/app/services/seo/seo.service.ts`).
  - Pinterest alan adı doğrulama kodu → `src/index.html`'e meta etiketi olarak eklenecek.
- [x] **PR #7 merge edildi**: Ana sayfadaki üç görselin daha küçük WebP kopyaları. https://github.com/zekeriyakoca/PrintMeArt-V2/pull/7

## Lansmandan önce

- [ ] **Çerez onayı**: Google Analytics ve PostHog şu an onaysız çalışıyor. Hollanda'da yasal risk (Autoriteit Persoonsgegevens), ve Google Ads AB'de Consent Mode v2 olmadan düzgün çalışmıyor. Legal sayfasındaki metin de onay istediğimizi söylüyor.
- [ ] **Gerçek bir test siparişi**: Ödeme → baskı → paketleme → kargo, baştan sona bir kez.
- [ ] **Yorumlar**: Kiyoh veya Trustpilot hesabı; ilk siparişlerden itibaren yorum topla. Google Shopping ve AI asistanlar da yorumlara bakıyor.
- [x] Şirket bilgileri (MeetTheMoose, KvK, BTW-id) footer'da ve yapısal veride.

## Fiyatlar netleşince

Önce `docs/TODO-pricing.md` (kâğıt ve çerçeve kararları, fiyat hataları).

- [ ] **Ürün feed'i** (`/feeds/products.xml`): Tek dosya üç yere gider. Fiyat sitedekiyle birebir aynı olmalı, yoksa ürünler reddedilir.
  - Google Merchant Center: Google Shopping'de ücretsiz listeleme.
  - Pinterest katalog.
  - Instagram / Facebook Shop: gönderilerde ürün etiketleme.
- [ ] Merchant Center ve Meta Commerce hesaplarını aç, kargo ve iade ayarlarını gir.

## Sonra

- [ ] Sanatçı ve müze sayfaları (`/artists/claude-monet` gibi): "Van Gogh print" tarzı aramalardan uzun vadeli trafik. Önce mockup.
- [ ] Reklam: önce az bütçeyle Instagram, sonra Google Shopping (Performance Max). AI asistanlarda reklam pratikte yok; orada görünmenin yolu Merchant Center feed'i ve yorumlar.
- [ ] Küçük temizlikler: kullanılmayan eski bileşenler (ImageGallery 1/2, SectionHero, NewsletterSignupSection, InputNumber), eski kullanılmayan import'lar.
- [ ] Ürün listesi ve ürün sayfasındaki büyük görseller (mobil skor 73–80): ilk satır görsellerinin lazy olmaması, ürün sayfasında mobil için daha küçük görsel.
