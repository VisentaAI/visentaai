import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
            Cookie Policy
          </h1>
          <ScrollArea className="h-[600px] glass rounded-3xl p-8">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Apa Itu Cookie?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookie adalah file teks kecil yang ditempatkan di perangkat Anda saat Anda mengunjungi situs web. Cookie membantu situs web mengingat informasi tentang kunjungan Anda, seperti preferensi bahasa dan pengaturan lainnya, membuat kunjungan berikutnya lebih mudah dan situs lebih berguna.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Jenis Cookie yang Kami Gunakan</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Cookie Esensial</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Cookie ini diperlukan untuk pengoperasian platform kami dan tidak dapat dinonaktifkan. Mereka biasanya hanya diatur sebagai respons terhadap tindakan Anda yang setara dengan permintaan layanan, seperti mengatur preferensi privasi, masuk, atau mengisi formulir.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Cookie Kinerja</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Cookie ini memungkinkan kami untuk menghitung kunjungan dan sumber lalu lintas sehingga kami dapat mengukur dan meningkatkan kinerja situs kami. Cookie ini membantu kami mengetahui halaman mana yang paling dan paling tidak populer dan melihat bagaimana pengunjung berpindah di sekitar situs.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Cookie Fungsional</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Cookie ini memungkinkan situs web untuk menyediakan fungsionalitas dan personalisasi yang ditingkatkan. Mereka dapat diatur oleh kami atau oleh penyedia pihak ketiga yang layanannya kami tambahkan ke halaman kami.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Cookie Penargetan</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Cookie ini dapat diatur melalui situs kami oleh mitra periklanan kami. Mereka dapat digunakan oleh perusahaan tersebut untuk membangun profil minat Anda dan menampilkan iklan yang relevan di situs lain.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Penggunaan Cookie VisentaAI</h2>
                <p className="text-muted-foreground leading-relaxed">
                  VisentaAI menggunakan cookie untuk:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Menjaga Anda tetap masuk ke akun Anda</li>
                  <li>Mengingat preferensi dan pengaturan Anda</li>
                  <li>Memahami bagaimana Anda berinteraksi dengan platform kami</li>
                  <li>Meningkatkan kecepatan dan keamanan situs</li>
                  <li>Mempersonalisasi konten dan rekomendasi pembelajaran</li>
                  <li>Menganalisis tren penggunaan untuk perbaikan layanan</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Cookie Pihak Ketiga</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami juga menggunakan layanan pihak ketiga yang dapat mengatur cookie di perangkat Anda, termasuk:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Google Analytics untuk analisis penggunaan</li>
                  <li>Layanan media sosial untuk integrasi berbagi</li>
                  <li>Penyedia layanan pembayaran untuk transaksi</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Mengelola Cookie</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Anda dapat mengontrol dan mengelola cookie dengan berbagai cara:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Pengaturan Browser: Sebagian besar browser memungkinkan Anda menolak atau menerima cookie</li>
                  <li>Penghapusan Cookie: Anda dapat menghapus cookie yang sudah ada di perangkat Anda</li>
                  <li>Preferensi Platform: Gunakan pengaturan preferensi cookie kami di dashboard akun</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Perhatikan bahwa menonaktifkan cookie tertentu dapat mempengaruhi fungsi platform kami dan pengalaman pengguna Anda.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Durasi Cookie</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookie yang kami gunakan memiliki durasi berbeda:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li><strong>Cookie Sesi:</strong> Dihapus saat Anda menutup browser</li>
                  <li><strong>Cookie Persisten:</strong> Tetap di perangkat Anda untuk periode yang ditentukan atau sampai Anda menghapusnya</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Perubahan pada Kebijakan Cookie</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami dapat memperbarui kebijakan cookie ini dari waktu ke waktu untuk mencerminkan perubahan dalam praktik kami atau untuk alasan operasional, hukum, atau regulasi lainnya. Kami akan memberi tahu Anda tentang perubahan signifikan melalui platform kami.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Informasi Lebih Lanjut</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Jika Anda memiliki pertanyaan tentang penggunaan cookie kami, silakan hubungi kami di hello@visentaai.com
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

export default CookiePolicy;
