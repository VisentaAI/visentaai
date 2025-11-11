import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Book, Code, Lightbulb, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Dokumentasi = () => {
  const sections = [
    {
      icon: Book,
      title: "Panduan Memulai",
      description: "Langkah-langkah untuk memulai menggunakan VisentaAI",
      items: [
        { title: "Membuat Akun", content: "Daftar dengan email atau akun Google Anda untuk mulai menggunakan platform VisentaAI." },
        { title: "Mengatur Profil", content: "Sesuaikan profil pembelajaran Anda untuk mendapatkan pengalaman yang lebih personal." },
        { title: "Memilih Kursus", content: "Jelajahi dan pilih kursus yang sesuai dengan tujuan pembelajaran Anda." }
      ]
    },
    {
      icon: Code,
      title: "Fitur Utama",
      description: "Pelajari cara menggunakan fitur-fitur VisentaAI",
      items: [
        { title: "AI Chat", content: "Bertanya apa saja kepada AI assistant untuk mendapatkan jawaban dan penjelasan yang detail." },
        { title: "Pembelajaran Adaptif", content: "Sistem akan menyesuaikan materi pembelajaran berdasarkan progress dan kemampuan Anda." },
        { title: "Analisis Progress", content: "Pantau kemajuan belajar Anda dengan dashboard analitik yang komprehensif." }
      ]
    },
    {
      icon: Lightbulb,
      title: "Tips & Trik",
      description: "Maksimalkan pengalaman belajar Anda",
      items: [
        { title: "Belajar Konsisten", content: "Luangkan waktu setiap hari untuk belajar, meskipun hanya 15-30 menit." },
        { title: "Gunakan AI Chat", content: "Jangan ragu untuk bertanya kepada AI jika ada konsep yang belum Anda pahami." },
        { title: "Review Berkala", content: "Lakukan review materi secara berkala untuk memperkuat pemahaman Anda." }
      ]
    },
    {
      icon: Settings,
      title: "Pengaturan",
      description: "Kustomisasi pengalaman pembelajaran Anda",
      items: [
        { title: "Notifikasi", content: "Atur preferensi notifikasi untuk pengingat belajar dan update kursus." },
        { title: "Privasi", content: "Kelola pengaturan privasi dan data personal Anda dengan mudah." },
        { title: "Preferensi Belajar", content: "Sesuaikan gaya dan kecepatan pembelajaran sesuai kebutuhan Anda." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Dokumentasi
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Panduan lengkap untuk memaksimalkan penggunaan platform VisentaAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="glass hover-lift">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`item-${itemIndex}`}>
                        <AccordionTrigger className="text-left">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.content}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
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

export default Dokumentasi;
