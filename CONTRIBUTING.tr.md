# olnk.tr'ye Katkıda Bulunma

olnk.tr'ye zaman ayırdığınız için teşekkür ederiz. Güvenilirliği, erişilebilirliği, güvenliği, yerelleştirmeyi, belgeleri veya kullanıcı deneyimini iyileştiren katkılar memnuniyetle karşılanır.

[İngilizce katkı rehberini okuyun](CONTRIBUTING.md)

## Davranış Kuralları

Katılım sağlayarak [Davranış Kuralları'na](CODE_OF_CONDUCT.tr.md) uymayı kabul edersiniz. Güvenlik açıklarını [SECURITY.tr.md](SECURITY.tr.md) içindeki özel bildirim süreciyle iletin.

## Başlamadan önce

1. Yinelenen çalışmaları önlemek için mevcut konuları ve çekme isteklerini arayın.
2. Büyük bir özellik, mimari değişiklik, veritabanı yeniden tasarımı veya uyumluluğu bozan değişiklik üzerinde çalışmadan önce konu açın.
3. Her katkıyı tek bir soruna odaklayın.
4. Kimlik bilgilerini, kişisel verileri, oluşturulmuş gizli değerleri veya ilgisiz biçimlendirme değişikliklerini eklemeyin.

Küçük hata düzeltmeleri ve belge iyileştirmeleri doğrudan çekme isteği olarak gönderilebilir.

## Geliştirme kurulumu

1. Depoyu çatallayın ve çatalınızı kopyalayın.
2. Güncel `main` dalından yeni bir dal oluşturun.
3. Bağımlılıkları kurup ortamı yapılandırın:

   ```bash
   corepack enable
   pnpm install
   cp .env.example .env
   pnpm exec auth secret
   ```

4. Oluşturulan gizli değeri ve PostgreSQL `DATABASE_URL` adresini `.env` dosyasına ekleyin.
5. Veritabanını hazırlayıp uygulamayı başlatın:

   ```bash
   pnpm db:generate
   pnpm db:migrate:dev
   pnpm dev
   ```

Şu örneklerdeki gibi kısa ve açıklayıcı dal adları kullanın:

- `feat/profile-scheduling`
- `fix/username-race`
- `docs/security-reporting`
- `refactor/payment-registry`

## Mühendislik yönergeleri

- Uçtan uca tür güvenliğini koruyun. Güvenilmeyen girdileri Zod ile doğrulayın; sunucu işlemlerini mevcut tRPC veya rota işleyicisi kalıpları üzerinden sunun.
- Var olan Next.js App Router, Prisma, Tailwind CSS ve bileşen kurallarını izleyin.
- Arayüzü mobil öncelikli, klavyeyle erişilebilir ve yardımcı teknolojilerle kullanılabilir tutun.
- Gereken yerlerde belirgin yüklenme, boş, başarılı ve hata durumları ekleyin.
- Yetkilendirmeyi, sahiplik denetimlerini, yönlendirme hedeflerini, yüklenen içerikleri ve ödeme geri çağrılarını güvenlik sınırı olarak değerlendirin.
- Kimlik bilgilerini, belirteçleri, ham ödeme verilerini veya gereksiz kişisel bilgileri toplamayın ve günlüklere yazmayın.
- Veritabanı sorgularını seçici tutun; herkese açık profiller ve analiz yollarındaki indeksleri koruyun.
- Etkilenen alanın sınama kapsamı varsa otomatik sınamaları ekleyin veya güncelleyin.
- Sağlanan yarar bakım, başarım ve güvenlik maliyetinden ağır basmadıkça yeni bağımlılık eklemeyin.
- Kullanıcıları veya katkıda bulunanları etkileyen değişikliklerde hem İngilizce hem Türkçe belgeleri güncelleyin.

### Veritabanı değişiklikleri

`prisma/schema.prisma` dosyasını değiştirirken:

1. `pnpm db:migrate:dev` ile açıklayıcı bir geçiş oluşturun.
2. Oluşturulan SQL'i veri kaybı, kilitler ve güvenli olmayan varsayılanlar açısından inceleyin.
3. Şemayı ve geçişi birlikte gönderin.
4. Dağıtım veya geriye dönük veri doldurma adımlarını çekme isteğinde açıklayın.
5. Makineniz dışında uygulanmış olabilecek bir geçişi hiçbir zaman düzenlemeyin; bunun yerine yeni bir geçiş ekleyin.

## Gönderim iletisi düzeni

Emir kipinde ve kısa bir özetle [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) düzenini kullanın:

```text
<tür>(isteğe-bağlı-kapsam): <özet>
```

Kabul edilen türler:

| Tür | Kullanım |
| --- | --- |
| `feat` | Kullanıcı tarafından görülen özellik |
| `fix` | Hata düzeltmesi |
| `docs` | Yalnızca belge değişikliği |
| `refactor` | Özellik veya düzeltme içermeyen iç değişiklik |
| `perf` | Başarım iyileştirmesi |
| `test` | Sınama ekleme veya düzeltmeleri |
| `build` | Derleme sistemi veya bağımlılık değişikliği |
| `ci` | Sürekli tümleştirme değişikliği |
| `chore` | Yukarıdakilerin dışındaki bakım işi |
| `revert` | Önceki bir değişikliği geri alma |

Örnekler:

```text
feat(editor): add scheduled link controls
fix(auth): prevent duplicate username claims
docs(readme): clarify PostgreSQL setup
```

Uyumluluk bilerek bozuluyorsa türden sonra `!` kullanın veya alt bilgiye `BREAKING CHANGE:` ekleyin.

## Kalite denetimleri

Çekme isteği açmadan önce şunları çalıştırın:

```bash
pnpm check
pnpm format:check
pnpm build
```

Etkilenen akışı dar mobil yerleşimler ve ilgili hata durumlarıyla birlikte elle de deneyin. Ortamınızda çalışmayan bir komut varsa nedenini çekme isteğinde açıklayın.

## Çekme istekleri

- Conventional Commits düzenine uygun bir çekme isteği başlığı kullanın.
- Sorunu, seçilen çözümü ve önemli ödünleşimleri açıklayın.
- Uygun olduğunda ilgili konuları `Closes #123` ile bağlayın.
- Görünür arayüz değişiklikleri için ekran görüntüleri veya kısa bir kayıt ekleyin.
- Şema değişikliklerini, yeni ortam değişkenlerini, dağıtım adımlarını ve geriye dönük uyumluluk kaygılarını belirtin.
- Oluşturulan dosyaları ve kilit dosyası değişikliklerini yalnızca katkı için gerekenlerle sınırlayın.
- Farkta, günlüklerde, ekran görüntülerinde veya sınama verilerinde gizli değer ya da hassas kullanıcı verisi bulunmadığını doğrulayın.
- Tamamlanmamış çalışmaları taslak çekme isteği olarak işaretleyin.
- İnceleme yorumlarını ek gönderimlerle ele alın; bakımcılar birleştirme sırasında gönderimleri tek gönderimde toplayabilir.

Etkin olmayan, kapsam dışı, güvenli olmayan veya yerini başka çalışma almış bir çekme isteği kapatılabilir. Bakımcılar kararın nedenini açıklamaya çalışacaktır.

## Katkıların lisanslanması

Bir katkı göndererek bu katkıyı sağlama hakkınız bulunduğunu doğrular ve gelir amaçlı kullanımda atıf koşulu dâhil olmak üzere katkınızı projenin güncel [olnk.tr Gelir Amaçlı Kullanımda Atıf Lisansı 1.0](LICENSE.tr) kapsamında lisanslamayı kabul edersiniz. Katkınızın telif hakkı sizde kalır. Bakımcıların yazılı onayı olmadan uyumsuz koşullara tabi çalışmalar göndermeyin veya ayrı koşullar eklemeyin.

## Hata bildirme

Yararlı bir hata bildirimi şunları içerir:

- Açık bir başlık ve beklenen davranış
- Hatanın yeniden oluşturulması için kesin adımlar
- Gerçekleşen davranış ve eksiksiz hata iletileri
- İlgili olduğunda tarayıcı, işletim sistemi, Node.js ve pnpm sürümleri
- Hassas verileri kaldırılmış en küçük örnek veya ekran görüntüleri

Şüpheli güvenlik açıkları için herkese açık konuları kullanmayın. Bunun yerine [SECURITY.tr.md](SECURITY.tr.md) yönergelerini izleyin.
