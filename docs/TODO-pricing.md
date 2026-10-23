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
