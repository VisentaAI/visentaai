import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
            Terms of Service
          </h1>
          <ScrollArea className="h-[600px] glass rounded-3xl p-8">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Penerimaan Ketentuan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Dengan mengakses dan menggunakan platform VisentaAI, Anda menyetujui untuk terikat oleh ketentuan layanan ini. Jika Anda tidak setuju dengan salah satu ketentuan, harap tidak menggunakan layanan kami.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Deskripsi Layanan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  VisentaAI menyediakan platform pembelajaran berbasis kecerdasan buatan yang dirancang untuk membantu pengguna dalam proses belajar. Layanan kami mencakup asisten AI, analisis pembelajaran, dan konten edukatif yang dipersonalisasi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Akun Pengguna</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Anda setuju untuk:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Memberikan informasi akurat dan terkini saat registrasi</li>
                  <li>Menjaga keamanan kredensial login Anda</li>
                  <li>Segera memberi tahu kami tentang penggunaan tidak sah</li>
                  <li>Tidak membagikan akun Anda dengan orang lain</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Penggunaan yang Diizinkan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Anda setuju untuk menggunakan layanan kami hanya untuk tujuan yang sah. Anda tidak diizinkan untuk:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                  <li>Menggunakan layanan untuk tujuan ilegal atau tidak etis</li>
                  <li>Mencoba mengakses sistem tanpa otorisasi</li>
                  <li>Mengganggu operasi normal platform</li>
                  <li>Menyalahgunakan atau mengeksploitasi AI untuk konten berbahaya</li>
                  <li>Melanggar hak kekayaan intelektual pihak lain</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Hak Kekayaan Intelektual</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Semua konten, fitur, dan fungsi layanan kami adalah dan akan tetap menjadi milik eksklusif VisentaAI. Anda diberikan lisensi terbatas untuk menggunakan platform untuk keperluan pembelajaran pribadi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Pembayaran dan Langganan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Beberapa fitur VisentaAI mungkin memerlukan pembayaran. Anda setuju untuk memberikan informasi pembayaran yang akurat dan membayar semua biaya yang berlaku. Kebijakan pengembalian dana berlaku sesuai dengan ketentuan yang ditetapkan.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Penghentian Layanan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami berhak untuk menangguhkan atau menghentikan akses Anda ke layanan kami kapan saja, dengan atau tanpa pemberitahuan, jika kami yakin Anda telah melanggar ketentuan ini atau terlibat dalam aktivitas yang merugikan.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Batasan Tanggung Jawab</h2>
                <p className="text-muted-foreground leading-relaxed">
                  VisentaAI tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami. Layanan disediakan "sebagaimana adanya" tanpa jaminan apapun.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Perubahan Ketentuan</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kami berhak untuk memodifikasi ketentuan layanan ini kapan saja. Perubahan akan efektif setelah dipublikasikan di platform. Penggunaan berkelanjutan setelah perubahan merupakan penerimaan Anda terhadap ketentuan yang direvisi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Hukum yang Berlaku</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ketentuan layanan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan akan diselesaikan melalui arbitrase atau pengadilan yang berwenang di Indonesia.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Kontak</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Untuk pertanyaan tentang ketentuan layanan ini, hubungi kami di hello@visentaai.com
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

export default TermsOfService;
