import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PlayCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Tutorial = () => {
  const tutorials = [
    {
      title: "Memulai dengan VisentaAI",
      description: "Tutorial lengkap untuk pengguna baru dalam menggunakan platform VisentaAI",
      duration: "10 menit",
      level: "Pemula",
      steps: 5,
      completed: false
    },
    {
      title: "Menggunakan AI Chat Secara Efektif",
      description: "Pelajari cara bertanya yang tepat untuk mendapatkan jawaban terbaik dari AI",
      duration: "15 menit",
      level: "Pemula",
      steps: 7,
      completed: false
    },
    {
      title: "Membuat Rencana Belajar Personal",
      description: "Cara membuat dan mengatur rencana belajar yang sesuai dengan tujuan Anda",
      duration: "20 menit",
      level: "Menengah",
      steps: 8,
      completed: false
    },
    {
      title: "Memaksimalkan Fitur Analitik",
      description: "Gunakan dashboard analitik untuk memantau dan meningkatkan progress belajar",
      duration: "12 menit",
      level: "Menengah",
      steps: 6,
      completed: false
    },
    {
      title: "Kolaborasi dan Grup Belajar",
      description: "Manfaatkan fitur kolaborasi untuk belajar bersama teman",
      duration: "18 menit",
      level: "Lanjutan",
      steps: 9,
      completed: false
    },
    {
      title: "Integrasi dengan Tools Lain",
      description: "Koneksikan VisentaAI dengan aplikasi productivity favorit Anda",
      duration: "25 menit",
      level: "Lanjutan",
      steps: 10,
      completed: false
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
    <div className="min-h-screen">
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
              <Card key={index} className="glass hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={getLevelColor(tutorial.level)}>
                      {tutorial.level}
                    </Badge>
                    {tutorial.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
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
                  <Button className="w-full" variant="default">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Mulai Tutorial
                  </Button>
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
