import { Brain, Target, Zap, Users, LineChart, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Pembelajaran Adaptif",
    description: "AI yang menyesuaikan konten dengan gaya belajar dan kecepatan Anda secara real-time."
  },
  {
    icon: Target,
    title: "Personalisasi Penuh",
    description: "Jalur pembelajaran yang dirancang khusus berdasarkan tujuan dan kemampuan Anda."
  },
  {
    icon: Zap,
    title: "Feedback Instan",
    description: "Dapatkan koreksi dan saran langsung dari AI untuk mempercepat pemahaman Anda."
  },
  {
    icon: Users,
    title: "Komunitas Kolaboratif",
    description: "Belajar bersama ribuan pelajar lain dan berbagi pengalaman belajar."
  },
  {
    icon: LineChart,
    title: "Analitik Progress",
    description: "Lacak perkembangan belajar Anda dengan visualisasi data yang detail dan mudah dipahami."
  },
  {
    icon: Shield,
    title: "Keamanan Terjamin",
    description: "Data dan privasi Anda dilindungi dengan enkripsi tingkat enterprise."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Fitur <span className="gradient-text">Unggulan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Teknologi AI terdepan yang dirancang untuk memaksimalkan pengalaman belajar Anda
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
