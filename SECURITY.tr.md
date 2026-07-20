# Güvenlik Politikası

[İngilizce güvenlik politikasını okuyun](SECURITY.md)

## Desteklenen sürümler

olnk.tr etkin olarak geliştirilmektedir ve henüz uzun süreli destek sürümleri yayımlamamaktadır.

| Sürüm | Destek durumu |
| --- | --- |
| Güncel üretim dağıtımı | Destekleniyor |
| En son `main` dalı | Destekleniyor |
| Eski gönderimler, çatallar ve üçüncü taraf dağıtımları | Desteklenmiyor |

Güvenlik düzeltmeleri etkin kod tabanına uygulanır. Sürümlendirilmiş yayımlar başladığında bakımcılar bu politikayı değiştirebilir.

## Güvenlik açığı bildirme

Şüpheli güvenlik açıklarını herkese açık bir konuda, tartışmada, çekme isteğinde, sosyal medya gönderisinde veya başka bir açık kanalda paylaşmayın.

Gizli bildirim göndermek için [GitHub özel güvenlik açığı bildirimini](https://github.com/MRsuffixx/OlnkTR/security/advisories/new) kullanın. Özel bildirim kullanılamıyorsa güvenlik açığının ayrıntılarını ilk iletide paylaşmadan güvenli bir iletişim kanalı istemek için [depo sahibinin GitHub profilinde](https://github.com/MRsuffixx) listelenen iletişim yöntemlerinden birini kullanın.

Mümkün olduğunca şu bilgileri ekleyin:

- Etkilenen rota, bileşen, gönderim veya dağıtım
- Güvenlik açığının türü ve olası etkisi
- Kesin yeniden oluşturma adımları veya en küçük kavram kanıtı
- Gereken hesap durumu, izinler ve yapılandırma
- Gizli değerler ile kişisel veriler çıkarılmış ilgili istek ve yanıt örnekleri
- Biliniyorsa önerilen azaltma yöntemi
- Sorunun başka biriyle paylaşılıp paylaşılmadığı

Yapay sınama verileri kullanın. Kimlik doğrulama gizli değerlerini, ödeme kimlik bilgilerini, oturum belirteçlerini, özel kullanıcı bilgilerini veya ilgisiz hesaplardan edinilmiş verileri eklemeyin.

## Yanıt süreci

Bakımcıların hedefleri şunlardır:

1. Eksiksiz bildirimi üç iş günü içinde aldığını doğrulamak.
2. Yedi iş günü içinde ilk değerlendirmeyi sunmak.
3. Düzeltme sürdüğü müddetçe en az yedi iş gününde bir ilerleme bilgisi paylaşmak.
4. Doğrulama, yayımlama zamanı, açıklama ve katkı belirtme adımlarını bildiren kişiyle eş güdümlemek.

Bu süreler garanti değildir. Karmaşık bildirimler, üçüncü taraf bağımlılıkları ve işletim kısıtları ek süre gerektirebilir. Yinelenen, yeniden oluşturulamayan veya kapsam dışı bildirimler açıklama yapılarak kapatılabilir.

## Eşgüdümlü açıklama

Herkese açık açıklamadan önce bakımcılara sorunu inceleyip düzeltme yayımlamaları için makul süre tanıyın. Sorunu göstermek için gereken en az miktarın ötesinde veriye erişmeyin; verileri değiştirmeyin, saklamayın veya paylaşmayın. Kişisel verilerle, üretim gizli değerleriyle, finansal bilgilerle veya hizmet kararsızlığıyla karşılaşırsanız sınamayı durdurup hemen bildirin.

Uygun olduğunda güvenlik duyurusu etkilenen sürümleri, etkiyi, düzeltmeyi ve bildiren kişiyi açıklar. Katkının belirtilmesi isteğe bağlıdır ve bildiren kişinin tercihine göre yapılır.

## Araştırma yönergeleri

İyi niyetli araştırmalar şunlara uymalıdır:

- Yalnızca sahibi olduğunuz veya sınama izni aldığınız hesap ve verileri kullanın.
- Gizlilik ihlalinden, hizmet kesintisinden, hizmet engellemeden, istenmeyen iletilerden, sosyal mühendislikten ve fiziksel saldırılardan kaçının.
- Aşırı trafik veya çok sayıda kayıt oluşturan otomatik sınamalardan kaçının.
- Bir sorunu doğruladıktan sonra kalıcılık sağlamayın, yıkıcı işlem yapmayın ve başka sistemlere ilerlemeyin.
- Geçerli yasalara ve üçüncü taraf sağlayıcıların kurallarına uyun.
- Açıklamadan önce bakımcılara düzeltme fırsatı verin.

Bu politikaya uyan araştırmalar proje tarafından kötü niyetli olarak değerlendirilmez. Bu ifade üçüncü tarafları bağlamaz ve geçerli yasalardan feragat anlamına gelmez.

## Genel olarak kapsam dışı konular

Aşağıdaki bildirimler somut bir güvenlik etkisi göstermedikçe genellikle uygun sayılmaz:

- Sömürülebilir bir sonucu olmayan eksik güvenlik üst bilgileri
- Kullanıcının kod yapıştırmasını gerektiren, yalnızca kendisini etkileyen siteler arası betik çalıştırma
- Hassas işlem içermeyen sayfalardaki arayüz yerleştirme saldırıları
- Uygulanabilir kötüye kullanım senaryosu içermeyen hız sınırı gözlemleri
- Güvenlik sınırını aşmayan kullanıcı adı, içerik veya istenmeyen ileti bildirimleri
- Yalnızca desteklenmeyen tarayıcılarda veya değiştirilmiş üçüncü taraf dağıtımlarında bulunan açıklar
- Elle doğrulama ve yeniden oluşturma adımı içermeyen otomatik tarayıcı çıktıları
- Sosyal mühendislik, hizmet engelleme veya fiziksel saldırılar

## Depoda bulunan gizli değerler

Depo geçmişinde bir kimlik bilgisi veya belirteç bulursanız özel olarak bildirin ve kullanmayı denemeyin. Dosyayı ve gönderimi belirtin; gizli değeri başka iletilere, konulara veya çekme isteklerine kopyalamayın.
