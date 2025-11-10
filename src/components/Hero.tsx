import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-ai-new.png";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full hover-scale">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Platform Pembelajaran AI Terdepan</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Belajar Lebih Cerdas dengan{" "}
              <span className="gradient-text hover-scale inline-block">VisentaAI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Platform pembelajaran berbasis AI yang mengadaptasi gaya belajar Anda. 
              Pengalaman belajar yang personal, interaktif, dan efektif untuk masa depan Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                onClick={() => window.location.href = '/chat'}
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all text-lg px-8 py-6 group shadow-lg"
              >
                Mulai Belajar Sekarang
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 hover-scale"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Pelajari Fitur
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="hover-scale">
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-muted-foreground">Pengguna Aktif</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="hover-scale">
                <div className="text-3xl font-bold gradient-text">50+</div>
                <div className="text-sm text-muted-foreground">Kursus AI</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="hover-scale">
                <div className="text-3xl font-bold gradient-text">98%</div>
                <div className="text-sm text-muted-foreground">Kepuasan</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-float animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full animate-pulse"></div>
            <img 
              src={heroImage} 
              alt="AI Learning Visualization" 
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl hover-lift transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
