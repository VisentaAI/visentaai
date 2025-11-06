import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-ai.png";

const Hero = () => {
  const scrollToDemo = () => {
    const element = document.getElementById("demo");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Platform Pembelajaran AI Terdepan</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Belajar Lebih Cerdas dengan{" "}
              <span className="gradient-text">VisentaAI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Platform pembelajaran berbasis AI yang mengadaptasi gaya belajar Anda. 
              Pengalaman belajar yang personal, interaktif, dan efektif untuk masa depan Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={scrollToDemo}
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-6 group"
              >
                Mulai Belajar Sekarang
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Pelajari Fitur
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div>
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-muted-foreground">Pengguna Aktif</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div>
                <div className="text-3xl font-bold gradient-text">50+</div>
                <div className="text-sm text-muted-foreground">Kursus AI</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div>
                <div className="text-3xl font-bold gradient-text">98%</div>
                <div className="text-sm text-muted-foreground">Kepuasan</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full"></div>
            <img 
              src={heroImage} 
              alt="AI Learning Visualization" 
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
