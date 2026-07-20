import { LegalPage } from "~/components/legal-page";

export const metadata = { title: "Gizlilik" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Gizlilik politikası" updated="20 Temmuz 2026">
      <section>
        <h2>Topladığımız bilgiler</h2>
        <p>
          Hesabını oluşturmak ve işletmek için e-posta adresini, profil
          bilgilerini, bağlantılarını, görünüm tercihlerini ve abonelik durumunu
          saklarız. Profil ziyaretlerinde tarih, yönlendiren sayfa, ülke kodu,
          cihaz türü ve tek yönlü anonim ziyaretçi özeti gibi sınırlı teknik
          verileri kaydedebiliriz. Ham IP adresini analitik kaydında saklamayız.
        </p>
      </section>
      <section>
        <h2>Ödeme bilgileri</h2>
        <p>
          Ödemeler seçtiğin sağlayıcı tarafından işlenir. Kart numaranı
          sunucularımızda saklamayız. Abonelik durumunu eşleştirmek,
          yenilemeleri kaydetmek ve fatura geçmişini göstermek için sağlayıcı
          referanslarını tutarız.
        </p>
      </section>
      <section>
        <h2>Bilgileri neden kullanıyoruz?</h2>
        <p>
          Verileri hesabına erişim sağlamak, profilini yayınlamak, analitik
          sunmak, aboneliğini yönetmek, kötüye kullanımı önlemek ve hizmeti
          güvenli biçimde geliştirmek için kullanırız. Bilgilerini reklam
          amacıyla satmayız.
        </p>
      </section>
      <section>
        <h2>Saklama, silme ve iletişim</h2>
        <p>
          Hesap bilgilerini hesabın açık olduğu sürece saklarız. Hesabını
          sildiğinde ilişkili kayıtlar silinir; yasal muhasebe kayıtları ve
          güvenlik yedekleri gerekli süre boyunca saklanabilir. Soruların için{" "}
          <a href="mailto:gizlilik@olnk.tr">gizlilik@olnk.tr</a> adresine
          yazabilirsin.
        </p>
      </section>
    </LegalPage>
  );
}
