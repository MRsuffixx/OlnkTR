# olnk.tr

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-veritabanı-4169E1?logo=postgresql&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)
[![Lisans](https://img.shields.io/badge/lisans-OMAL--1.0-5C4EE5)](LICENSE.tr)
![Katkılara açık](https://img.shields.io/badge/katkılara-açık-brightgreen.svg)

Öncelikle Türkçe konuşan içerik üreticileri, profesyoneller ve küçük işletmeler için geliştirilen mobil öncelikli bir biyografi bağlantısı platformudur. Her kullanıcı, bağlantılarını yayımlayabileceği, profilini kişiselleştirebileceği, QR kodunu paylaşabileceği ve ziyaretçi etkileşimlerini inceleyebileceği `olnk.tr/[kullanici-adi]` adresine sahip olur.

[İngilizce belgeleri okuyun](README.md)

> [!NOTE]
> olnk.tr etkin olarak geliştirilmektedir. Kararlı sürümden önce özellikler ve veri modelleri değişebilir.

## Temel özellikler

- **Kimlik doğrulama ve ilk kurulum:** Auth.js ile Google OAuth ve şifresiz e-posta girişi; normalleştirilmiş ve veritabanı düzeyinde benzersiz kullanıcı adları.
- **Kullanıcı adı güvenliği:** Ayrılmış rota denetimleri, Türkçe duyarlı normalleştirme, gizlemeye dayanıklı içerik denetimi ve veritabanından yönetilen engel listesi.
- **Herkese açık profiller:** Standart adres, Open Graph verileri, yapılandırılmış veri, duyarlı yerleşim ve indirilebilir QR koduyla hızlı, sunucuda oluşturulan sayfalar.
- **Profil düzenleyici:** Canlı telefon önizlemesi, tıklayarak düzenleme, sürükleyip bırakarak sıralama ve revizyon duyarlı otomatik kayıt sunan bölünmüş ekranlı panel.
- **Görünüm ayarları:** Özel arka planlar, yazı biçimleri, düğme stilleri, yerleşimler, görsel efektler, bağlantı bazlı biçimlendirme ve isteğe bağlı özel CSS.
- **Bağlantı denetimleri:** Zamanlanmış bağlantılar, parola koruması, YouTube ve Spotify yerleştirmeleri, görünürlük seçenekleri ve güvenli yönlendirme.
- **Analizler:** Yönlendirmeyi geciktirmeyen tıklama ve profil görüntüleme kaydı; yönlendiren kaynak, ülke, cihaz ve zaman bazlı içgörüler.
- **Ödeme ve depolama:** Pro özellikleri için isteğe bağlı ödeme sağlayıcıları ve S3 uyumlu medya depolama desteği.
- **Hesap yönetimi:** Profil ayarları, kullanıcı adı değişiklikleri, abonelik yönetimi ve kalıcı hesap silme.

## Teknoloji yığını

| Katman | Teknoloji |
| --- | --- |
| Uygulama | Next.js 16, React 19, TypeScript 6 |
| Uygulama programlama arayüzü ve doğrulama | tRPC 11, TanStack Query, Zod 4, SuperJSON |
| Kimlik doğrulama | Auth.js / NextAuth 5, Prisma bağdaştırıcısı, Google OAuth, Nodemailer |
| Veritabanı | PostgreSQL, Prisma 7 |
| Biçimlendirme | Tailwind CSS 4 |
| Etkileşim | dnd kit, Lucide React |
| Ödeme | Stripe, iyzico, PayTR, Adyen |
| Depolama | S3 uyumlu nesne depolama |
| Paket yöneticisi | pnpm 11 |

## Başlangıç

### Gereksinimler

- Node.js 20.19+, 22.13+ veya 24+
- Corepack ya da doğrudan kurulum üzerinden pnpm 11
- Çalışan bir PostgreSQL veritabanı
- En az bir kimlik doğrulama sağlayıcısı: Google OAuth veya SMTP sunucusu

### 1. Depoyu kopyalayın

```bash
git clone https://github.com/MRsuffixx/OlnkTR.git
cd OlnkTR
corepack enable
pnpm install
```

Prisma istemcisi `pnpm dev`, `pnpm build` veya açıkça çalıştırılan
`pnpm db:generate` komutuyla oluşturulur. `pnpm start` bağımlılıkları değiştirmez
ve önceden hazırlanmış bir üretim derlemesi bekler.

### 2. Ortamı yapılandırın

Örnek dosyayı kopyalayıp yer tutucu değerleri değiştirin:

```bash
cp .env.example .env
pnpm exec auth secret
```

Oluşturulan değeri `.env` içindeki `AUTH_SECRET` alanına ekleyin.

| Değişken grubu | Amaç | Zorunluluk |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL bağlantı adresi | Zorunlu |
| `AUTH_SECRET` | Oturum ve belirteç güvenliği | Üretimde zorunlu, yerelde önerilir |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth | Google girişi etkinse zorunlu |
| `EMAIL_SERVER`, `EMAIL_FROM` | Şifresiz e-posta girişi | E-posta girişi etkinse zorunlu |
| `NEXT_PUBLIC_APP_URL` | Uygulamanın standart adresi | Önerilir |
| Ödeme sağlayıcısı değişkenleri | Pro plan ödeme akışı ve bildirimleri | İsteğe bağlı |
| `STORAGE_*` | S3 uyumlu profil görseli ve arka plan yüklemeleri | İsteğe bağlı |

Google OAuth için şu geri dönüş adreslerini kaydedin:

- Yerel: `http://localhost:3000/api/auth/callback/google`
- Üretim: `https://alan-adiniz.example/api/auth/callback/google`

`.env` dosyasını veya üretim kimlik bilgilerini hiçbir zaman depoya göndermeyin.

### 3. Veritabanını hazırlayın

```bash
pnpm db:generate
pnpm db:migrate:dev
```

Sürümlenmiş geçişleri dağıtım ortamında uygularken bunun yerine `pnpm db:migrate` komutunu kullanın.

### 4. Geliştirme ortamını başlatın

```bash
pnpm dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Kullanılabilir komutlar

| Komut | Açıklama |
| --- | --- |
| `pnpm dev` | Turbopack geliştirme sunucusunu başlatır |
| `pnpm build` | Üretim derlemesi oluşturur |
| `pnpm start` | Üretim sunucusunu çalıştırır |
| `pnpm check` | ESLint ve TypeScript denetimlerini çalıştırır |
| `pnpm lint` | Uyarıya izin vermeden ESLint'i çalıştırır |
| `pnpm typecheck` | Dosya üretmeden TypeScript denetimi yapar |
| `pnpm format:check` | Biçimlendirmeyi denetler |
| `pnpm format:write` | Desteklenen kaynak dosyalarını biçimlendirir |
| `pnpm db:generate` | Prisma istemcisini oluşturur |
| `pnpm db:migrate:dev` | Geliştirme geçişlerini oluşturur veya uygular |
| `pnpm db:migrate` | Sürümlenmiş geçişleri uygular |
| `pnpm db:studio` | Prisma Studio'yu açar |

## Proje yapısı

```text
prisma/                 Veritabanı şeması ve geçişler
src/app/                Next.js rotaları, sayfaları ve rota işleyicileri
src/components/         Yeniden kullanılabilir arayüz ve profil bileşenleri
src/config/             Ürün ilkeleri ve sabit yapılandırma
src/lib/                Paylaşılan şemalar, normalleştirme ve yardımcı araçlar
src/server/api/         Tür güvenli tRPC yordamları
src/server/auth/        Kimlik doğrulama yapılandırması
src/server/payments/    Ödeme sağlayıcısı bağdaştırıcıları ve faturalama hizmetleri
src/server/security/    Bağlantı erişimi ve içerik güvenliği araçları
```

## Katkıda bulunma

Bir konu ya da çekme isteği açmadan önce [CONTRIBUTING.tr.md](CONTRIBUTING.tr.md) dosyasını okuyun. Bu projeye katılım [Davranış Kuralları](CODE_OF_CONDUCT.tr.md) kapsamındadır.

Güvenlik açıklarını herkese açık bir konuda paylaşmak yerine [SECURITY.tr.md](SECURITY.tr.md) yönergelerine göre özel olarak bildirin.

## Lisans

olnk.tr, özel [olnk.tr Gelir Amaçlı Kullanımda Atıf Lisansı 1.0](LICENSE.tr) kapsamında sunulur. Projeyi kullanabilir, değiştirebilir, çatallayabilir, yeniden dağıtabilir, satabilir veya barındırabilirsiniz. Gelir amaçlı kullanımda çalışmanın olnk.tr'yi temel aldığı açıkça belirtilmeli ve [özgün depoya](https://github.com/MRsuffixx/OlnkTR) bağlantı verilmelidir.

Lisans, kâr paylaşımını veya değiştirilmiş kaynak kodunun açıklanmasını gerektirmez. Bu bir kaynak kodu erişilebilir lisansıdır; OSI onaylı bir açık kaynak lisansı değildir. Metinler arasında farklılık olması durumunda [İngilizce lisans](LICENSE) geçerlidir.
