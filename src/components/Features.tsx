import { Brain, Target, Zap, Users, LineChart, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: t('features.adaptive.title'),
      description: t('features.adaptive.desc')
    },
    {
      icon: Target,
      title: t('features.personalization.title'),
      description: t('features.personalization.desc')
    },
    {
      icon: Zap,
      title: t('features.feedback.title'),
      description: t('features.feedback.desc')
    },
    {
      icon: Users,
      title: t('features.community.title'),
      description: t('features.community.desc')
    },
    {
      icon: LineChart,
      title: t('features.analytics.title'),
      description: t('features.analytics.desc')
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.desc')
    }
  ];

  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            {t('features.title')} <span className="gradient-text">{t('features.title')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
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
                <feature.icon className="w-7 h-7 text-primary-foreground" />
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
