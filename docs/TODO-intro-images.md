# TODO: Liste sayfası başlık görselleri

Kategori, sanatçı, müze ve koleksiyon sayfalarının başlık bölümünde, metnin yanında küçük bir görsel gösteriliyor.
- Görsellerin listesi: `src/app/shared/intro-images.ts` → `INTRO_IMAGES`.
- Anahtar: sayfanın `categoryName` ya da `attributeName` değeri.
- Bir sayfanın görseli yoksa bölüm görselsiz gösteriliyor.

Şu an sadece Claude Monet'in görseli var, o da harici bir adreste (Britannica). Bütün görseller kendi blob storage'ımıza alınacak.

## Kapsam

| Grup | Sayı | Görsel |
|---|---|---|
| Sanatçılar | 331 | Sanatçının portresi |
| Müzeler (Origin) | 42 | Müze binasının fotoğrafı ya da ikonu |
| Koleksiyonlar / stiller | 14 | O stilin tipik bir eseri |
| Kategoriler | 23 | Kategoriyi temsil eden bir eser |

**Öncelik:** Önce sitemap'teki sayfalar (en az 3 printi olanlar): yaklaşık 35 sanatçı, 11 müze, 13 koleksiyon ve 19 kategori. Gerisi sonra.

## Kaynak ve lisans kuralları (en önemli kısım)

**Sanatçı portreleri:**
- Sadece **public domain** portreler: sanatçının otoportresi ya da 1900'den önce çekilmiş fotoğrafı (örneğin Monet için Nadar'ın fotoğrafı).
- Kaynak: Wikimedia Commons. Dosya sayfasında lisansın "Public domain" olduğunu kontrol et.
- Müzelerin open-access koleksiyonları da kullanılabilir: Rijksmuseum, Met, Art Institute of Chicago, National Gallery of Art, Cleveland.
- Britannica, Getty Images, Alamy ve benzerleri **kullanılmaz** (telifli).

**Portresi olmayan sanatçılar:** Katalogdaki kendi eserlerinden biri. Bunlar zaten public domain.

**Müzeler:**
- **Logolar kullanılmaz.** Tescilli markalar; izinsiz kullanmak resmi bir ortaklık izlenimi verir.
- Bina fotoğrafı: Wikimedia Commons'ta **CC0 ya da public domain** olanlar. CC BY ve CC BY-SA kaynak gösterilmesini ister; o zaman bir alt yazı gerekir. Bunlardan kaçın ya da alt yazıyı ekle.
- Uygun fotoğraf yoksa: o müzeden gelen bir eserimiz (örneğin Rijksmuseum için Avercamp).

**Koleksiyonlar ve kategoriler:** Katalogdaki en temsilî eserlerden biri. Ürün görselimizi küçültüp kullan; lisans derdi yok.

Her görselin kaynağını (URL, lisans) `scripts/museum-content/intro-images.json` dosyasına kaydet ki sonradan kontrol edilebilsin.

## Teknik

1. **Format:**
   - WebP, kare ya da tasarımdaki orana göre kırpılmış, gösterilen boyutun 2 katı (thumbnail için yaklaşık 160–240 px).
   - Kalite 80 civarı; her biri en fazla birkaç KB olmalı.
2. **Yer:**
   - `genstorageaccount3116` hesabı, `printme-images` container'ı, `intros/<grup>/<slug>.webp` yolu (örneğin `intros/artist/claude-monet.webp`).
   - Content-type `image/webp`, `Cache-Control: public, max-age=2592000, immutable`. Ana sayfa görsellerinde de aynı ayarı kullandık.
3. **Liste:** `INTRO_IMAGES` blob adresleriyle doldurulacak; elle değil, `intro-images.json`'dan üretilecek.
4. **Kontrol:**
   - Her anahtar gerçek bir filtre seçeneğiyle birebir aynı olmalı (`GET /catalog/v1/storefront/filter-options`).
   - Her adres 200 dönmeli.
   - Lokalde birkaç sayfaya bakıp görselin kırpılmasını ve netliğini kontrol et.

## Nasıl yaptırılır

Yerel bir oturumda yapılmalı, remote'ta değil: Azure CLI'ın giriş yapılmış olması, blob'a yazma izni ve görselleri işlemek için ImageMagick ya da cwebp gerekiyor.

Görevin özeti: "TODO-intro-images.md'deki kurallara göre önce sitemap'teki yaklaşık 78 sayfanın görsellerini bul, lisansını kontrol et, küçült, blob'a yükle, kaynakları intro-images.json'a yaz, INTRO_IMAGES'ı güncelle ve lokalde göster." Main'e push etmeden önce kullanıcıya göster.
