# TODO: Fiyat

Kâğıt ve çerçeve varsayılanları için karar bekleniyor. Karar verilene kadar fiyat koduna dokunulmuyor.

## 1. Varsayılan kâğıt fiyata gitmiyor

- Ürün sayfası kâğıt olarak **Hahnemühle Photo Rag**'i (Museum) seçili gösteriyor, ama kâğıt seçeneği sadece tıklanınca gönderiliyor (`paper-options.component.ts`, `select()`).
- Bu yüzden gösterilen fiyat hiçbir gerçek kâğıdın fiyatı değil. Örnek: ürün 401, 13x18, Rolled-up, No Mat:

  | Kâğıt | Fiyat |
  |---|---|
  | Gönderilmiyor (sayfadaki) | €9,40 |
  | Home | €9,87 |
  | Studio | €10,34 |
  | Gallery | €11,04 |
  | Museum | €11,04 |

- Kâğıda tıklamadan sepete eklenen siparişlerde kâğıt bilgisi yok.
- Karar:
  - **(a)** Görünen Photo Rag gerçekten gönderilsin (sayfa fiyatı €11,04 olur), ya da
  - **(b)** Varsayılan kâğıt her yerde en ucuzu (Home, €9,87) olsun.

## 2. Çerçeve varsayılanı

- Çerçeve listesi ilk seçeneği (Rolled-up) otomatik seçip gönderiyor (`frame-options.component.ts`).
- Varsayılan çerçeve ve fiyatı netleşmeli.

## 3. Kartlardaki "Vanaf" fiyatı ürün sayfasıyla uyuşmuyor

- `api.service.ts` → `fetchFromPrice()`: ilk ürünün her grubundaki ilk seçenekle (Museum kâğıdı dahil) hesaplıyor, sonra `Math.floor(price) + 0.99` ile yukarı yuvarlıyor ve "Vanaf €11,99" gösteriyor.
- Ürün sayfası aynı ürün için €9,40 gösteriyor.
- Kararlar (1, 2) netleşince "Vanaf" = gerçekten alınabilecek en düşük fiyat olmalı, yuvarlama olmadan.

## 4. Kararlardan sonra (SEO)

- Ürün yapısal verisindeki `Offer` ve Pinterest `product:price` etiketleri şu an sayfada gösterilen fiyatı kullanıyor ve sadece tarayıcıda ekleniyor. Fiyat sunucuda da hesaplanırsa Google ilk okumada görür.
- Google Merchant Center ve Pinterest ürün feed'i (`/feeds/products.xml`): feed'deki fiyat sayfadakiyle birebir aynı olmalı, yoksa Google ürünleri reddeder. Bu yüzden 1–3 bitmeden yapılmamalı.

## 5. Saal Digital ile baskı (deneme süresi, 2026-10-24)

20–30 sağlıklı satıştan sonra kendi Canon yazıcımızla (60×90'a kadar) basmaya geçilecek. Maliyetler %35 bayi indirimi sonrası, BTW hariç:

| Ürün | Maliyet |
|---|---|
| Photo Rag 50×70 | €27,93 |
| Photo Rag 60×90 | €40,29 |
| Poster mat 50×70 | €11,28 |
| Poster silk 50×70 | €12,89 |
| Poster mat 60×90 | €17,19 |

Kargo sipariş başına €5,78 (ekspres €16,53).

**Fiyat dengesi:**
- **Photo Rag:** Site fiyatı (50×70'te €53,50) Saal'ın kendi liste fiyatıyla (≈ €52) neredeyse aynı. Marj yaklaşık %24 ve tamamen bayi indirimine bağlı.
- **Poster:** 50×70'te marj yaklaşık %59.
- **Öneri:** Photo Rag 50×70 yaklaşık €69–75, 60×90 yaklaşık €95–99. Karar bekliyor.

**Kâğıt kararları:**
1. **German Etching → Hahnemühle Museum Etching.** Saal'da German Etching yok.
   - Saal'daki fine art kâğıtları: Bamboo Natural Line, Baryta, Hemp Natural Line, Museum Etching, Photo Rag.
   - Museum Etching: 350 g/m², %100 pamuk, ince dokulu, ISO 9706. Aynı rol ("dokulu, yağlı boya hissi").
   - Sitedeki "310 g/m² · 100% katoen" metni "350 g/m² · 100% katoen" olacak.
   - Saal'daki maliyeti henüz bilinmiyor.
2. **Canson Rag Photographique sitede kalıyor**, "Binnenkort / Coming soon" olarak: seçilemez görünecek, kendi yazıcıyla açılacak.
3. **Poster (Home) metni Saal mat posterine göre değişecek:**
   - Yeni içerik: Fujifilm Crystal Archive DP II fotoğraf kâğıdı, mat, 234 g/m², fijn structuur, geen reflecties, ongevoelig voor vingerafdrukken (Saal'ın kendi açıklaması).
   - Çıkacaklar: "Fine Art", "200 g/m²", "FSC" ve "giclée 12 kleuren".
   - Önerilen NL metin: "Premium Poster · 234 g/m² · Fujifilm-fotopapier · fijn mat".
4. **Aynı yanlışı içeren başka metinler:**
   - Ürün sayfasındaki genel satır: "Giclée-gedrukt op fine-art papier van 200 g/m² (mat)".
   - "Twijfel je nog?" metni: "hetzelfde giclée-proces in 12 kleuren".
   - Seçenek grubunun adı: "Paper (100% cotton)".
5. **Canon'a geçerken:** Poster kâğıdı tekrar değişecek. Inkjet yazıcı Fujifilm fotoğraf kâğıdına basamaz; metni o zaman güncelle.
