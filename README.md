# olnk.tr

Türkçe içerik üreticileri ve küçük işletmeler için mobil öncelikli link paylaşım platformu. Next.js 15, TypeScript, tRPC, Prisma, PostgreSQL, Auth.js ve Tailwind CSS ile geliştirilmiştir.

## Ürün kapsamı

- Google OAuth ve e-posta bağlantısıyla şifresiz giriş
- Ön rezervasyonlu, veritabanı kısıtlarıyla yarış durumlarına dayanıklı kullanıcı adı kaydı
- Ayrılmış rota ve değiştirilebilir veritabanı engel listesiyle Türkçe/obfuscation duyarlı ad denetimi
- Sunucuda hazırlanan profil sayfaları, profil QR kodu ve SEO metadata
- Yan yana canlı telefon önizlemeli, dokunmatik uyumlu sürükle-bırak düzenleyici
- Seri hale getirilmiş, revizyon kontrollü otomatik kayıt
- Tema, arka plan, yazı karakteri ve bağlantı görünümü özelleştirme
- Yanıtı bekletmeden yazılan ham tıklama olayları ve 30 günlük analitik
- Profil, kullanıcı adı ve kalıcı hesap silme ayarları

## Yerel kurulum

1. `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun.
2. PostgreSQL veritabanını başlatın.
3. Bağımlılıkları ve Prisma istemcisini hazırlayın:

   ```bash
   pnpm install
   pnpm db:generate
   ```

4. Veritabanı migrasyonunu uygulayın ve geliştirme sunucusunu başlatın:

   ```bash
   pnpm db:migrate
   pnpm dev
   ```

Google OAuth yönlendirme adresi üretimde `https://alan-adiniz/api/auth/callback/google`, yerelde `http://localhost:3000/api/auth/callback/google` olmalıdır. SMTP sağlayıcısı `EMAIL_SERVER` içinde standart bağlantı URL'si biçiminde tanımlanır.

## Doğrulama

```bash
pnpm check
pnpm build
```

İlk ürün migrasyonu `prisma/migrations/20260720130000_init_product` altında sürümlenmiştir. Kullanıcı adı politika varsayılanları `src/config/username-policy.ts` içinde; çalışma sırasında eklenebilen moderasyon terimleri ise `UsernameBlocklist` tablosunda tutulur.

## Mimari notlar

- `usernameNormalized` alanındaki benzersiz indeks son kullanıcı adı otoritesidir. Ön kontroller yalnızca hızlı geri bildirim sağlar; son yazma yine aynı kısıta çarpar.
- Düzenleyici her değişikliği yerelde önizler. Sunucu kayıtları revizyon numarasıyla seri gönderilir; eski bir yanıt yeni taslağı ezemez ve başka sekme çatışmaları açıkça gösterilir.
- `/go/[id]` hedefi bulduktan sonra hemen yönlendirir. Tıklama olayı Next.js `after()` içinde yazıldığı için ziyaretçinin yönlendirmesi analitik ekleme süresini beklemez.
- Profil resimleri ve arka plan görselleri URL tabanlıdır. Üretimde dosya yükleme eklenecekse nesne depolama, MIME doğrulaması ve görüntü dönüştürme katmanı birlikte eklenmelidir.
