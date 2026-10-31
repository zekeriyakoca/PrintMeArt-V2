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

- [x] **Ürün feed'i** (2026-10-31): Tek feed üç yere gider (RSS 2.0, Google `g:` alanları; Pinterest ve Meta da okuyor).
  - Hollandaca (ana pazar): https://printmeart.nl/feeds/products.xml
  - İngilizce (sonrası için): https://printmeart.nl/feeds/products-en.xml
  - Fiyat, ürün sayfasının varsayılan fiyatı (katalogdaki en ucuz fiyat, %21 BTW dahil). Kargo NL/BE/DE için ürün başına feed'de.
  - Liste ve fiyatlar saatte bir, ürün detayları (ressam, hikâye, kategori) günde bir yenilenir. Her deploy'dan sonra feed ~8 dakika hazırlanır; o sırada 503 + `Retry-After` döner, platformlar sonra tekrar dener.
- [ ] **Google Merchant Center**: Google Shopping'de ücretsiz listeleme.
  1. merchants.google.com'da hesap aç (MeetTheMoose, ülke Hollanda, para birimi EUR). printmeart.nl'yi doğrula ve sahiplen; Search Console ile aynı Google hesabıyla en kolayı.
  2. İşletme bilgileri: adres, iletişim e-postası, telefon. Ürünler → Ürün kaynakları → "Ürün kaynağı ekle" → "URL'den dosya" → `https://printmeart.nl/feeds/products.xml`, dil Hollandaca, ülke Hollanda, günlük getirme.
  3. Kargo: Gönderim ve iadeler → kargo hizmeti. NL €5,99 (€50 üstü ücretsiz), BE/DE €7,95, AB'nin geri kalanı €12,95; teslimat 1–5 iş günü. Feed NL/BE/DE'yi zaten taşıyor; diğer AB ülkelerinde satılacaksa ülkeleri hesapta da ekle.
  4. İade politikası: 30 gün, iade kargosu müşteriye ait, posta ile; iade sayfası linki `https://printmeart.nl/nl/legal#returns`.
  5. "Ücretsiz listeleme" programını aç. İlk incelemede reddedilen ürün varsa "Teşhis" sekmesine bak (en sık sebep: sayfa fiyatı ≠ feed fiyatı).
- [ ] **Pinterest katalog**: Business hesap gerekli (yukarıdaki madde). Önce alan adını doğrula (meta etiketi `src/index.html`'e eklenecek, kodu bana ver). Sonra Ads → Kataloglar → Veri kaynağı oluştur → feed URL'si `https://printmeart.nl/feeds/products.xml`, format XML, para birimi EUR, ülke NL, dil NL. Pinterest günlük çeker; onaylanınca ürün pinleri oluşur.
- [ ] **Instagram / Facebook Shop**: business.facebook.com'da Meta Business hesabı + Commerce Manager. Katalog oluştur (E-ticaret) → Veri kaynakları → Veri feed'i → planlı feed → `https://printmeart.nl/feeds/products.xml`, günlük, EUR. Mağazayı (Shop) aç, Instagram business hesabını bağla, alan adını Business Ayarları → Markalı İçerik → Alan Adları'ndan doğrula. Kargo ve iade bilgilerini Commerce Manager → Ayarlar'a gir (yukarıdaki ücretler, 30 gün iade (kargo müşteriye ait)). Ürün etiketleme, Instagram'ın mağaza incelemesinden sonra açılır.

## Sonra

- [ ] Sanatçı ve müze sayfaları (`/artists/claude-monet` gibi): "Van Gogh print" tarzı aramalardan uzun vadeli trafik. Önce mockup.
- [ ] Reklam: önce az bütçeyle Instagram, sonra Google Shopping (Performance Max). AI asistanlarda reklam pratikte yok; orada görünmenin yolu Merchant Center feed'i ve yorumlar.
- [x] Küçük temizlikler: kullanılmayan bileşenler ve import'lar kaldırıldı (2026-10-31).
- [ ] Ürün listesi ve ürün sayfasındaki büyük görseller (mobil skor 73–80): ilk satır görsellerinin lazy olmaması, ürün sayfasında mobil için daha küçük görsel.
