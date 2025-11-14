import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import aiEducationImg from "@/assets/blog/ai-education-future.jpg";
import effectiveLearningImg from "@/assets/blog/effective-learning-ai.jpg";
import personalizedLearningImg from "@/assets/blog/personalized-learning.jpg";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Masa Depan Pendidikan dengan AI",
      excerpt: "Bagaimana kecerdasan buatan mengubah cara kita belajar dan mengajar di era digital.",
      author: "Tim VisentaAI",
      date: "15 Januari 2025",
      category: "Teknologi",
      image: aiEducationImg,
      fullContent: {
        introduction: "Kecerdasan buatan (AI) telah merevolusi berbagai aspek kehidupan kita, dan pendidikan adalah salah satu bidang yang mengalami transformasi paling signifikan. Dari personalisasi pembelajaran hingga otomasi tugas administratif, AI membuka peluang baru yang tak terbatas dalam dunia pendidikan.",
        sections: [
          {
            title: "AI dalam Pembelajaran Personalisasi",
            content: "Teknologi AI memungkinkan sistem pembelajaran yang dapat menyesuaikan dengan kecepatan dan gaya belajar setiap siswa. Platform pembelajaran adaptif menggunakan algoritma machine learning untuk mengidentifikasi area yang perlu diperkuat dan menyesuaikan materi pembelajaran secara real-time."
          },
          {
            title: "Otomasi dan Efisiensi",
            content: "AI membantu guru mengotomatiskan tugas-tugas repetitif seperti penilaian dan penjadwalan, memberikan mereka lebih banyak waktu untuk fokus pada interaksi langsung dengan siswa dan pengembangan metode pengajaran yang lebih kreatif."
          },
          {
            title: "Aksesibilitas Global",
            content: "Dengan AI, pendidikan berkualitas tinggi menjadi lebih mudah diakses secara global. Penerjemahan otomatis, tutor virtual, dan konten pembelajaran yang dapat disesuaikan membuat pendidikan lebih inklusif dan merata untuk semua orang, terlepas dari lokasi geografis atau latar belakang ekonomi."
          },
          {
            title: "Analitik Pembelajaran yang Mendalam",
            content: "AI menyediakan analitik yang detail tentang performa siswa, membantu mengidentifikasi pola pembelajaran, kekuatan, dan area yang memerlukan perhatian lebih. Data ini memungkinkan intervensi yang lebih tepat waktu dan efektif."
          }
        ],
        conclusion: "Masa depan pendidikan dengan AI adalah masa depan yang penuh dengan kemungkinan. Meskipun teknologi tidak akan menggantikan peran guru, AI akan menjadi alat yang sangat berharga dalam meningkatkan kualitas pembelajaran dan membuat pendidikan lebih personal, efisien, dan mudah diakses untuk semua."
      }
    },
    {
      id: 2,
      title: "Tips Belajar Efektif dengan AI",
      excerpt: "Strategi dan metode untuk memaksimalkan pembelajaran menggunakan teknologi AI.",
      author: "Tim VisentaAI",
      date: "10 Januari 2025",
      category: "Tutorial",
      image: effectiveLearningImg,
      fullContent: {
        introduction: "Memanfaatkan teknologi AI dalam pembelajaran dapat meningkatkan efektivitas belajar Anda secara signifikan. Berikut adalah tips dan strategi terbaik untuk memaksimalkan penggunaan AI dalam perjalanan pembelajaran Anda.",
        sections: [
          {
            title: "1. Mulai dengan Tujuan yang Jelas",
            content: "Sebelum menggunakan AI untuk belajar, tentukan tujuan pembelajaran Anda dengan spesifik. AI bekerja paling baik ketika Anda memberikan konteks dan arah yang jelas. Tetapkan milestone dan target yang ingin Anda capai."
          },
          {
            title: "2. Ajukan Pertanyaan yang Spesifik",
            content: "Saat berinteraksi dengan AI chatbot atau asisten pembelajaran, ajukan pertanyaan yang spesifik dan terstruktur. Semakin detail pertanyaan Anda, semakin relevan dan berguna jawaban yang akan Anda terima. Berikan konteks yang diperlukan untuk membantu AI memahami kebutuhan Anda."
          },
          {
            title: "3. Gunakan AI untuk Practice dan Repetisi",
            content: "Manfaatkan AI untuk latihan berulang dan penguatan konsep. AI tidak pernah lelah dan dapat memberikan feedback instant pada latihan Anda. Gunakan ini untuk memperkuat pemahaman Anda tentang materi yang sulit."
          },
          {
            title: "4. Kombinasikan dengan Metode Pembelajaran Tradisional",
            content: "AI adalah alat yang powerful, tetapi tidak harus menggantikan semua metode pembelajaran tradisional. Kombinasikan penggunaan AI dengan membaca buku, diskusi kelompok, dan praktek langsung untuk pembelajaran yang paling efektif."
          },
          {
            title: "5. Review dan Refleksi Secara Berkala",
            content: "Gunakan fitur analitik AI untuk mereview progress Anda secara berkala. Identifikasi area yang perlu ditingkatkan dan sesuaikan strategi pembelajaran Anda berdasarkan insights yang diberikan oleh AI."
          }
        ],
        conclusion: "Dengan menerapkan tips ini, Anda dapat memanfaatkan kekuatan AI untuk membuat pembelajaran Anda lebih efektif, efisien, dan menyenangkan. Ingat, kunci sukses adalah konsistensi dan adaptasi berkelanjutan terhadap feedback yang Anda terima."
      }
    },
    {
      id: 3,
      title: "Personalisasi Pembelajaran: Kunci Sukses",
      excerpt: "Mengapa setiap siswa membutuhkan pendekatan pembelajaran yang unik dan personal.",
      author: "Tim VisentaAI",
      date: "5 Januari 2025",
      category: "Edukasi",
      image: personalizedLearningImg,
      fullContent: {
        introduction: "Setiap siswa adalah unik dengan gaya belajar, kecepatan pemahaman, dan minat yang berbeda. Pembelajaran yang dipersonalisasi mengakui keunikan ini dan menyesuaikan pendekatan pendidikan untuk setiap individu, menciptakan pengalaman belajar yang lebih efektif dan engaging.",
        sections: [
          {
            title: "Memahami Gaya Belajar Individual",
            content: "Penelitian menunjukkan bahwa siswa memiliki preferensi belajar yang berbeda - visual, auditori, kinestetik, atau kombinasi dari ketiganya. Pembelajaran yang dipersonalisasi mengidentifikasi gaya belajar dominan setiap siswa dan menyesuaikan materi pembelajaran accordingly."
          },
          {
            title: "Kecepatan Belajar yang Fleksibel",
            content: "Tidak semua siswa belajar dengan kecepatan yang sama. Sistem pembelajaran personal memungkinkan siswa untuk maju dengan pace mereka sendiri - menghabiskan lebih banyak waktu pada konsep yang challenging dan bergerak lebih cepat pada materi yang mereka kuasai dengan mudah."
          },
          {
            title: "Konten yang Relevan dengan Minat",
            content: "Ketika pembelajaran terhubung dengan minat dan tujuan siswa, engagement dan retensi meningkat secara dramatis. Personalisasi memungkinkan konten disesuaikan dengan passion dan aspirasi karir siswa, membuat pembelajaran lebih bermakna dan motivating."
          },
          {
            title: "Feedback dan Dukungan yang Tepat Waktu",
            content: "Pembelajaran personal memberikan feedback yang spesifik dan tepat waktu, disesuaikan dengan kebutuhan individual. Ini membantu siswa memahami area yang perlu ditingkatkan dan mendapatkan dukungan yang mereka butuhkan exactly when they need it."
          },
          {
            title: "Membangun Kepercayaan Diri",
            content: "Ketika pembelajaran disesuaikan dengan kemampuan dan kecepatan siswa, mereka lebih mungkin mengalami kesuksesan. Kesuksesan ini membangun kepercayaan diri, yang pada gilirannya meningkatkan motivasi dan kemauan untuk tackle challenges yang lebih besar."
          }
        ],
        conclusion: "Personalisasi pembelajaran bukan hanya trend, tetapi merupakan fundamental shift dalam cara kita mendekati pendidikan. Dengan teknologi AI dan adaptive learning systems, kita sekarang memiliki tools untuk truly personalize education at scale, memberikan setiap siswa kesempatan terbaik untuk sukses."
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Blog VisentaAI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Artikel, insights, dan update terbaru tentang teknologi AI dalam pendidikan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="glass hover-lift overflow-hidden group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full group/btn">
                        Baca Selengkapnya
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[85vh]">
                      <DialogHeader>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                              {post.category}
                            </span>
                          </div>
                          <DialogTitle className="text-3xl">{post.title}</DialogTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{post.date}</span>
                            </div>
                          </div>
                        </div>
                      </DialogHeader>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-6">
                          <div className="relative h-80 overflow-hidden rounded-lg">
                            <img 
                              src={post.image} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="prose prose-lg max-w-none">
                            <p className="text-muted-foreground leading-relaxed text-base">
                              {post.fullContent.introduction}
                            </p>
                          </div>

                          <Separator className="my-6" />

                          {post.fullContent.sections.map((section, idx) => (
                            <div key={idx} className="space-y-3">
                              <h3 className="text-xl font-semibold text-foreground">
                                {section.title}
                              </h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {section.content}
                              </p>
                            </div>
                          ))}

                          <Separator className="my-6" />

                          <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Kesimpulan</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {post.fullContent.conclusion}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 pt-6 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{post.date}</span>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
