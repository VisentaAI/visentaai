import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Zap, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";

const Hero = () => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        particles.slice(i + 1).forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      {/* AI Animated Background */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="ai-grid absolute inset-0"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full hover-scale">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {t('hero.title')}{" "}
              <span className="gradient-text hover-scale inline-block">VisentaAI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                onClick={() => window.location.href = '/chat'}
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all text-lg px-8 py-6 group shadow-lg"
              >
                {t('hero.cta.start')}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 hover-scale"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                {t('hero.cta.features')}
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="hover-scale">
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-muted-foreground">{t('hero.stats.users')}</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="hover-scale">
                <div className="text-3xl font-bold gradient-text">50+</div>
                <div className="text-sm text-muted-foreground">{t('hero.stats.courses')}</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="hover-scale">
                <div className="text-3xl font-bold gradient-text">98%</div>
                <div className="text-sm text-muted-foreground">{t('hero.stats.satisfaction')}</div>
              </div>
            </div>

            {/* Floating AI Icons */}
            <div className="flex justify-center space-x-8 pt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center hover-lift ai-wave" style={{ animationDelay: '0s' }}>
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center hover-lift ai-wave" style={{ animationDelay: '0.2s' }}>
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center hover-lift ai-wave" style={{ animationDelay: '0.4s' }}>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
