import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
            Privacy Policy
          </h1>
          <ScrollArea className="h-[600px] glass rounded-3xl p-8">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Informasi yang Kami Kumpulkan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  VisentaAI mengumpulkan informasi yang Anda berikan secara langsung, termasuk nama, alamat email, dan data pembelajaran. Kami juga mengumpulkan data teknis seperti alamat IP, jenis browser, dan informasi perangkat untuk meningkatkan layanan kami.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Penggunaan Informasi</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Informasi yang kami kumpulkan digunakan untuk:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Menyediakan dan meningkatkan layanan AI pembelajaran</li>
                  <li>Personalisasi pengalaman belajar Anda</li>
                  <li>Mengirimkan notifikasi dan pembaruan penting</li>
                  <li>Menganalisis penggunaan platform untuk perbaikan berkelanjutan</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Berbagi Informasi</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Informasi hanya dibagikan dengan:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Penyedia layanan yang membantu operasional platform kami</li>
                  <li>Otoritas hukum jika diwajibkan oleh hukum</li>
                  <li>Pihak ketiga dengan persetujuan eksplisit Anda</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Keamanan Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami menggunakan enkripsi SSL/TLS untuk melindungi data Anda selama transmisi. Data disimpan di server yang aman dengan akses terbatas dan dimonitor secara berkala untuk mendeteksi aktivitas mencurigakan.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Cookie dan Teknologi Pelacakan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami menggunakan cookie untuk meningkatkan pengalaman pengguna. Cookie membantu kami mengingat preferensi Anda dan menganalisis lalu lintas situs. Anda dapat mengelola preferensi cookie melalui pengaturan browser Anda.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Hak Anda</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Anda memiliki hak untuk:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Mengakses dan memperbarui informasi pribadi Anda</li>
                  <li>Meminta penghapusan data Anda</li>
                  <li>Menolak pemrosesan data tertentu</li>
                  <li>Memindahkan data Anda ke platform lain</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Perubahan Kebijakan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan dikomunikasikan melalui email atau notifikasi di platform. Kami mendorong Anda untuk meninjau kebijakan ini secara berkala.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Kontak</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, hubungi kami di hello@visentaai.com
                </p>
              </section>

              <p className="text-sm text-muted-foreground mt-8 pt-4 border-t border-border">
                Terakhir diperbarui: 08 November 2025
              </p>
            </div>
          </ScrollArea>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
