import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, MessageSquare, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Tutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const steps = [
    {
      icon: Sparkles,
      title: t('tutorial.welcome'),
      description: t('tutorial.welcome.desc'),
    },
    {
      icon: Target,
      title: t('tutorial.features'),
      description: t('tutorial.features.desc'),
    },
    {
      icon: MessageSquare,
      title: t('tutorial.chat'),
      description: t('tutorial.chat.desc'),
    },
    {
      icon: Rocket,
      title: t('tutorial.start'),
      description: t('tutorial.start.desc'),
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsOpen(false);
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">{currentStep.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center space-x-2 my-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === step ? 'bg-primary w-8' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            {t('tutorial.skip')}
          </Button>
          <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-primary to-secondary">
            {step < steps.length - 1 ? t('tutorial.next') : t('tutorial.finish')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Tutorial;
