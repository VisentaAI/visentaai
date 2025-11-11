import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const benefits = [
    t('about.benefit1'),
    t('about.benefit2'),
    t('about.benefit3'),
    t('about.benefit4')
  ];

  return (
    <section id="about" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              {t('about.title')} <span className="gradient-text">VisentaAI</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.desc1')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.desc2')}
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
              <div className="text-sm text-muted-foreground">{t('about.partners')}</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center space-y-2 hover-lift mt-8">
              <div className="text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-muted-foreground">{t('about.support')}</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center space-y-2 hover-lift">
              <div className="text-4xl font-bold gradient-text">15+</div>
              <div className="text-sm text-muted-foreground">{t('about.languages')}</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center space-y-2 hover-lift mt-8">
              <div className="text-4xl font-bold gradient-text">∞</div>
              <div className="text-sm text-muted-foreground">{t('about.possibilities')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
