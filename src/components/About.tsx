import { CheckCircle2 } from "lucide-react";

const About = () => {
  const benefits = [
    "Teknologi AI terbaru dari penelitian terdepan",
    "Kurikulum yang dirancang oleh expert di bidang pendidikan",
    "Update konten regular mengikuti perkembangan teknologi",
    "Sertifikat yang diakui industri"
  ];

  return (
    <section id="about" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              Tentang <span className="gradient-text">VisentaAI</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              VisentaAI adalah platform pembelajaran berbasis AI yang revolusioner, 
              dikembangkan untuk membuat pendidikan lebih personal, efektif, dan accessible 
              bagi semua orang.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kami percaya bahwa setiap orang belajar dengan cara yang berbeda. 
              Dengan teknologi AI terdepan, kami menghadirkan pengalaman belajar yang 
              benar-benar disesuaikan dengan kebutuhan unik setiap individu.
            </p>
            
            <div className="space-y-4 pt-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 text-center space-y-2 hover-lift">
              <div className="text-4xl font-bold gradient-text">100+</div>
              <div className="text-sm text-muted-foreground">Mitra Institusi</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center space-y-2 hover-lift mt-8">
              <div className="text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-muted-foreground">Support AI</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center space-y-2 hover-lift">
              <div className="text-4xl font-bold gradient-text">15+</div>
              <div className="text-sm text-muted-foreground">Bahasa</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center space-y-2 hover-lift mt-8">
              <div className="text-4xl font-bold gradient-text">∞</div>
              <div className="text-sm text-muted-foreground">Kemungkinan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
