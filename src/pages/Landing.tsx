import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Users, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import logo from "@/assets/logo.png";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="absolute inset-0 ai-grid opacity-30" />
      
      <Card className="relative glass max-w-2xl w-full p-8 md:p-12 shadow-2xl animate-scale-in">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <img 
              src={logo} 
              alt="VisentaAI Logo" 
              className="relative w-24 h-24 object-contain animate-float" 
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">
              Welcome to VisentaAI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
              Your intelligent companion for learning, connecting, and growing together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-xl">
            <Card className="p-4 border-primary/20 hover-lift">
              <Bot className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground mt-1">Smart chat for learning</p>
            </Card>
            
            <Card className="p-4 border-primary/20 hover-lift">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Community</h3>
              <p className="text-xs text-muted-foreground mt-1">Connect with others</p>
            </Card>
            
            <Card className="p-4 border-primary/20 hover-lift">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Direct Messages</h3>
              <p className="text-xs text-muted-foreground mt-1">Private conversations</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <Button 
              onClick={() => navigate("/auth")} 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Landing;
