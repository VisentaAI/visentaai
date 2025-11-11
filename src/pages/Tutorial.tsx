import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PlayCircle, CheckCircle, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import gettingStartedImg from "@/assets/tutorials/getting-started.jpg";
import aiChatImg from "@/assets/tutorials/ai-chat.jpg";
import learningPlanImg from "@/assets/tutorials/learning-plan.jpg";
import analyticsImg from "@/assets/tutorials/analytics.jpg";
import collaborationImg from "@/assets/tutorials/collaboration.jpg";
import integrationImg from "@/assets/tutorials/integration.jpg";

const Tutorial = () => {
  const [expandedTutorial, setExpandedTutorial] = useState<number | null>(null);

  const tutorials = [
    {
      title: "Memulai dengan VisentaAI",
      description: "Tutorial lengkap untuk pengguna baru dalam menggunakan platform VisentaAI",
      duration: "10 menit",
      level: "Pemula",
      steps: 5,
      completed: false,
      image: gettingStartedImg,
      fullContent: {
        overview: "Selamat datang di VisentaAI! Tutorial ini akan memandu Anda melalui langkah-langkah dasar untuk memulai perjalanan pembelajaran Anda dengan platform AI kami yang canggih.",
        topics: [
          "Membuat akun dan setup profil",
          "Navigasi dashboard dan fitur utama",
          "Memahami antarmuka pengguna",
          "Mengatur preferensi pembelajaran",
          "Memulai percakapan pertama dengan AI"
        ],
        keyTakeaways: "Setelah menyelesaikan tutorial ini, Anda akan memahami dasar-dasar platform VisentaAI dan siap untuk memulai perjalanan pembelajaran yang dipersonalisasi."
      }
    },
    {
      title: "Menggunakan AI Chat Secara Efektif",
      description: "Pelajari cara bertanya yang tepat untuk mendapatkan jawaban terbaik dari AI",
      duration: "15 menit",
      level: "Pemula",
      steps: 7,
      completed: false,
      image: aiChatImg,
      fullContent: {
        overview: "Maksimalkan potensi AI chatbot dengan mempelajari teknik bertanya yang efektif. Tutorial ini mengajarkan cara merumuskan pertanyaan yang jelas dan mendapatkan jawaban yang paling relevan.",
        topics: [
          "Teknik bertanya yang efektif",
          "Memberikan konteks yang tepat",
          "Memahami respons AI",
          "Menggunakan follow-up questions",
          "Menyimpan dan mengorganisir percakapan penting",
          "Tips dan trik untuk hasil optimal",
          "Menghindari kesalahan umum"
        ],
        keyTakeaways: "Anda akan menguasai seni berkomunikasi dengan AI untuk mendapatkan informasi yang Anda butuhkan dengan cepat dan akurat."
      }
    },
    {
      title: "Membuat Rencana Belajar Personal",
      description: "Cara membuat dan mengatur rencana belajar yang sesuai dengan tujuan Anda",
      duration: "20 menit",
      level: "Menengah",
      steps: 8,
      completed: false,
      image: learningPlanImg,
      fullContent: {
        overview: "Buat rencana pembelajaran yang terstruktur dan sesuai dengan tujuan karir Anda. Tutorial ini membantu Anda merancang jalur pembelajaran yang efektif dan terukur.",
        topics: [
          "Menentukan tujuan pembelajaran",
          "Membuat timeline yang realistis",
          "Memilih topik dan materi yang relevan",
          "Mengatur milestone dan checkpoint",
          "Memonitor progress belajar",
          "Menyesuaikan rencana berdasarkan feedback",
          "Integrasi dengan kalender",
          "Tips manajemen waktu"
        ],
        keyTakeaways: "Anda akan memiliki rencana pembelajaran yang jelas, terstruktur, dan dapat dilacak untuk mencapai tujuan Anda dengan lebih efisien."
      }
    },
    {
      title: "Memaksimalkan Fitur Analitik",
      description: "Gunakan dashboard analitik untuk memantau dan meningkatkan progress belajar",
      duration: "12 menit",
      level: "Menengah",
      steps: 6,
      completed: false,
      image: analyticsImg,
      fullContent: {
        overview: "Pelajari cara menggunakan dashboard analitik untuk mendapatkan insights mendalam tentang progress pembelajaran Anda dan area yang perlu ditingkatkan.",
        topics: [
          "Membaca grafik dan statistik pembelajaran",
          "Memahami metrik progress",
          "Identifikasi kekuatan dan kelemahan",
          "Menggunakan insights untuk optimasi",
          "Export dan share laporan",
          "Set up notifikasi dan reminder"
        ],
        keyTakeaways: "Anda akan dapat menggunakan data untuk membuat keputusan pembelajaran yang lebih baik dan meningkatkan efektivitas belajar Anda."
      }
    },
    {
      title: "Kolaborasi dan Grup Belajar",
      description: "Manfaatkan fitur kolaborasi untuk belajar bersama teman",
      duration: "18 menit",
      level: "Lanjutan",
      steps: 9,
      completed: false,
      image: collaborationImg,
      fullContent: {
        overview: "Tingkatkan pembelajaran dengan berkolaborasi dengan sesama learner. Tutorial ini mengajarkan cara membentuk dan mengelola grup belajar yang produktif.",
        topics: [
          "Membuat dan join grup belajar",
          "Berbagi materi dan resources",
          "Diskusi grup dan forum",
          "Peer review dan feedback",
          "Kolaborasi real-time",
          "Mengatur jadwal grup",
          "Memimpin study group yang efektif",
          "Mengelola kontribusi anggota",
          "Best practices kolaborasi online"
        ],
        keyTakeaways: "Anda akan mahir dalam menggunakan fitur kolaborasi untuk meningkatkan pembelajaran melalui interaksi dengan komunitas."
      }
    },
    {
      title: "Integrasi dengan Tools Lain",
      description: "Koneksikan VisentaAI dengan aplikasi productivity favorit Anda",
      duration: "25 menit",
      level: "Lanjutan",
      steps: 10,
      completed: false,
      image: integrationImg,
      fullContent: {
        overview: "Integrasikan VisentaAI dengan tools productivity favorit Anda untuk workflow yang lebih seamless. Tutorial ini mencakup setup dan konfigurasi berbagai integrasi.",
        topics: [
          "Overview integrasi yang tersedia",
          "Koneksi dengan Google Workspace",
          "Integrasi dengan Microsoft Office",
          "Setup Slack dan Discord notifications",
          "Sinkronisasi dengan note-taking apps",
          "Calendar integration",
          "Automation dengan Zapier",
          "API dan custom integrations",
          "Troubleshooting common issues",
          "Security dan privacy settings"
        ],
        keyTakeaways: "Anda akan dapat menghubungkan VisentaAI dengan ekosistem tool Anda untuk produktivitas maksimal."
      }
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Pemula":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Menengah":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Lanjutan":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Tutorial
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Panduan langkah demi langkah untuk menguasai VisentaAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="glass hover-lift overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={tutorial.image} 
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className={`${getLevelColor(tutorial.level)} backdrop-blur-sm`}>
                      {tutorial.level}
                    </Badge>
                  </div>
                  {tutorial.completed && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-6 h-6 text-green-500 bg-background rounded-full" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{tutorial.title}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{tutorial.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      <span>{tutorial.steps} langkah</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full" variant="default">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Mulai Tutorial
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Baca Selengkapnya
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">{tutorial.title}</DialogTitle>
                          <DialogDescription className="text-base">
                            {tutorial.description}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-6">
                            <div>
                              <img 
                                src={tutorial.image} 
                                alt={tutorial.title}
                                className="w-full h-64 object-cover rounded-lg mb-4"
                              />
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Gambaran Umum</h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {tutorial.fullContent.overview}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold mb-3">Yang Akan Anda Pelajari</h3>
                              <ul className="space-y-2">
                                {tutorial.fullContent.topics.map((topic, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold mb-2">Hasil Pembelajaran</h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {tutorial.fullContent.keyTakeaways}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{tutorial.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <PlayCircle className="w-4 h-4" />
                                  <span>{tutorial.steps} langkah</span>
                                </div>
                                <Badge variant="outline" className={getLevelColor(tutorial.level)}>
                                  {tutorial.level}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-2xl glass text-center">
            <h2 className="text-3xl font-bold mb-4">Butuh Tutorial Khusus?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Jika Anda membutuhkan tutorial untuk kasus penggunaan spesifik, jangan ragu untuk menghubungi tim support kami.
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

export default Tutorial;
