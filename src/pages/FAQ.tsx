import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      category: "Umum",
      questions: [
        {
          q: "Apa itu VisentaAI?",
          a: "VisentaAI adalah platform pembelajaran berbasis AI yang revolusioner, dirancang untuk memberikan pengalaman belajar yang personal dan adaptif. Platform ini menggunakan kecerdasan buatan untuk menyesuaikan materi dengan kebutuhan setiap siswa."
        },
        {
          q: "Siapa yang bisa menggunakan VisentaAI?",
          a: "VisentaAI dapat digunakan oleh siapa saja yang ingin belajar, mulai dari pelajar, mahasiswa, hingga profesional yang ingin meningkatkan keterampilan mereka."
        },
        {
          q: "Apakah VisentaAI gratis?",
          a: "VisentaAI menawarkan paket gratis dengan fitur dasar, serta paket premium dengan fitur-fitur lanjutan untuk pengalaman pembelajaran yang lebih maksimal."
        }
      ]
    },
    {
      category: "Fitur",
      questions: [
        {
          q: "Bagaimana cara kerja AI Chat?",
          a: "AI Chat menggunakan model bahasa yang canggih untuk memahami pertanyaan Anda dan memberikan jawaban yang akurat dan relevan. Anda bisa bertanya apa saja tentang materi pembelajaran yang sedang Anda pelajari."
        },
        {
          q: "Apa itu pembelajaran adaptif?",
          a: "Pembelajaran adaptif adalah sistem yang secara otomatis menyesuaikan tingkat kesulitan dan jenis materi berdasarkan performa dan kemampuan Anda. Semakin Anda belajar, sistem akan semakin memahami kebutuhan Anda."
        },
        {
          q: "Bagaimana cara melacak progress belajar?",
          a: "Dashboard analitik kami menyediakan visualisasi lengkap tentang progress belajar Anda, termasuk waktu belajar, materi yang sudah dikuasai, dan area yang perlu ditingkatkan."
        }
      ]
    },
    {
      category: "Akun & Keamanan",
      questions: [
        {
          q: "Bagaimana cara membuat akun?",
          a: "Anda bisa mendaftar menggunakan email atau akun Google Anda. Proses pendaftaran sangat cepat dan mudah, hanya membutuhkan beberapa menit saja."
        },
        {
          q: "Apakah data saya aman?",
          a: "Ya, kami sangat serius dalam menjaga keamanan data pengguna. Semua data dienkripsi dan disimpan dengan standar keamanan tertinggi. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin Anda."
        },
        {
          q: "Bagaimana cara mengganti password?",
          a: "Anda bisa mengganti password melalui menu Pengaturan > Keamanan. Pastikan menggunakan password yang kuat untuk keamanan akun Anda."
        }
      ]
    },
    {
      category: "Teknis",
      questions: [
        {
          q: "Platform apa yang didukung?",
          a: "VisentaAI dapat diakses melalui browser web di desktop, laptop, tablet, dan smartphone. Kami merekomendasikan menggunakan browser terbaru untuk pengalaman terbaik."
        },
        {
          q: "Bagaimana jika menemukan bug atau error?",
          a: "Silakan laporkan bug atau error yang Anda temukan melalui halaman Support. Tim kami akan segera menindaklanjuti laporan Anda."
        },
        {
          q: "Apakah ada aplikasi mobile?",
          a: "Saat ini kami sedang mengembangkan aplikasi mobile untuk iOS dan Android. Website kami sudah responsive dan dapat diakses dengan baik melalui mobile browser."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              FAQ
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Pertanyaan yang sering diajukan tentang VisentaAI
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari pertanyaan..."
                className="pl-12 h-12 glass"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="glass">
                <CardHeader>
                  <CardTitle className="text-2xl">{category.category}</CardTitle>
                  <CardDescription>
                    {category.questions.length} pertanyaan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:text-primary">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Tidak menemukan jawaban yang Anda cari?
              </p>
              <Button size="lg" variant="default">
                Hubungi Support
              </Button>
            </div>
          )}

          <div className="mt-16 p-8 rounded-2xl glass text-center">
            <h2 className="text-3xl font-bold mb-4">Masih Ada Pertanyaan?</h2>
            <p className="text-muted-foreground mb-6">
              Tim support kami siap membantu Anda 24/7
            </p>
            <Button size="lg" variant="default">
              Hubungi Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
