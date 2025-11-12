import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Languages, User, Users, MessageSquare, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import usFlag from "@/assets/flags/us.png";
import idFlag from "@/assets/flags/id.png";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logo-white.png";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { Badge } from "@/components/ui/badge";
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { communityUnread, directUnread } = useUnreadCounts();
  
  const currentLogo = theme === 'dark' ? logoWhite : logo;
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
    if (!isHomePage) {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass shadow-md" : "bg-transparent"}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={handleLogoClick}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <img src={currentLogo} alt="VisentaAI Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold gradient-text">VisentaAI</span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <button onClick={() => scrollToSection("home")} className="text-foreground hover:text-primary transition-colors px-3">
            {t('nav.home')}
          </button>
          <button onClick={() => scrollToSection("features")} className="text-foreground hover:text-primary transition-colors px-3">
            {t('nav.features')}
          </button>
          <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-primary transition-colors px-3">
            {t('nav.about')}
          </button>
          <button onClick={() => scrollToSection("testimonials")} className="text-foreground hover:text-primary transition-colors px-3">
            {t('nav.testimonials')}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2">
                <img src={usFlag} alt="English" className="h-5 w-5 rounded" />
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('id')} className="gap-2">
                <img src={idFlag} alt="Bahasa Indonesia" className="h-5 w-5 rounded" />
                Bahasa Indonesia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <User className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate("/community")} className="relative">
            <Users className="h-5 w-5" />
            {communityUnread > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {communityUnread > 9 ? "9+" : communityUnread}
              </Badge>
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} className="relative">
            <MessageSquare className="h-5 w-5" />
            {directUnread > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {directUnread > 9 ? "9+" : directUnread}
              </Badge>
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate("/private-communities")} title="Private Communities">
            <Shield className="h-5 w-5" />
          </Button>

          <Button onClick={() => navigate("/chat")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('nav.chat')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && <div className="md:hidden glass border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button onClick={() => scrollToSection("home")} className="text-left text-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </button>
            <button onClick={() => scrollToSection("features")} className="text-left text-foreground hover:text-primary transition-colors">
              {t('nav.features')}
            </button>
            <button onClick={() => scrollToSection("about")} className="text-left text-foreground hover:text-primary transition-colors">
              {t('nav.about')}
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-left text-foreground hover:text-primary transition-colors">
              {t('nav.testimonials')}
            </button>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setLanguage(language === 'en' ? 'id' : 'en')} className="flex-1">
                <img src={language === 'en' ? usFlag : idFlag} alt={language === 'en' ? 'English' : 'Bahasa Indonesia'} className="h-4 w-4 mr-2 rounded" />
                {language === 'en' ? 'EN' : 'ID'}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="flex-1">
                {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>

            <Button onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }} variant="outline" className="w-full">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>

            <Button onClick={() => { navigate("/community"); setIsMobileMenuOpen(false); }} variant="outline" className="w-full relative">
              <Users className="h-4 w-4 mr-2" />
              Community
              {communityUnread > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {communityUnread > 9 ? "9+" : communityUnread}
                </Badge>
              )}
            </Button>

            <Button onClick={() => { navigate("/messages"); setIsMobileMenuOpen(false); }} variant="outline" className="w-full relative">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
              {directUnread > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {directUnread > 9 ? "9+" : directUnread}
                </Badge>
              )}
            </Button>

            <Button onClick={() => { navigate("/private-communities"); setIsMobileMenuOpen(false); }} variant="outline" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Private Communities
            </Button>

            <Button onClick={() => navigate("/chat")} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
              {t('nav.chat')}
            </Button>
          </div>
        </div>}
    </nav>;
};
export default Navbar;