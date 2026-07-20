import { LegalPage } from "~/components/legal-page";

export const metadata = { title: "Kullanım koşulları" };

export default function TermsPage() {
  return (
    <LegalPage title="Kullanım koşulları" updated="20 Temmuz 2026">
      <section>
        <h2>Hizmetin kapsamı</h2>
        <p>
          olnk, bağlantılarını herkese açık bir profil altında yayınlamanı,
          görünümü özelleştirmeni ve istatistikleri incelemeni sağlar.
          Hesabındaki içerikten ve yönlendirdiğin sayfalardan sen sorumlusun.
        </p>
      </section>
      <section>
        <h2>Abonelik ve yenileme</h2>
        <p>
          Pro planı aylık veya yıllık alabilirsin. Stripe, iyzico ve Adyen
          desteklenen akışlarda dönem sonunda otomatik yenileyebilir; PayTR
          satın alımları kart saklamadan dönemlik erişim verir ve yeni dönem
          için tekrar ödeme gerektirir. İptal, mevcut ödenmiş dönemin sonuna
          kadar erişimi kaldırmaz.
        </p>
      </section>
      <section>
        <h2>Kabul edilmeyen kullanım</h2>
        <p>
          Yasa dışı, yanıltıcı, zararlı, nefret veya taciz içeren; başkalarının
          haklarını ihlal eden; kötü amaçlı yazılım, kimlik avı veya istenmeyen
          iletişim dağıtan içerikler yasaktır.
        </p>
      </section>
      <section>
        <h2>İçerik, erişim ve iletişim</h2>
        <p>
          İçeriğinin mülkiyeti sende kalır. Güvenlik, yasal yükümlülük veya bu
          koşulların ihlali halinde içeriği kaldırabilir ya da erişimi
          kısıtlayabiliriz. Soruların için{" "}
          <a href="mailto:merhaba@olnk.tr">merhaba@olnk.tr</a> adresine
          yazabilirsin.
        </p>
      </section>
    </LegalPage>
  );
}
