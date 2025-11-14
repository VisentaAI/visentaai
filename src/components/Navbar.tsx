import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Languages, User, Users, MessageSquare, Shield, Search, Clock, BookOpen, UserPlus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, languageNames } from "@/contexts/LanguageContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logo-white.png";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { Badge } from "@/components/ui/badge";

// Import all flags
import usFlag from "@/assets/flags/us.png";
import idFlag from "@/assets/flags/id.png";
import esFlag from "@/assets/flags/es.png";
import frFlag from "@/assets/flags/fr.png";
import deFlag from "@/assets/flags/de.png";
import itFlag from "@/assets/flags/it.png";
import ptFlag from "@/assets/flags/pt.png";
import brFlag from "@/assets/flags/br.png";
import ruFlag from "@/assets/flags/ru.png";
import cnFlag from "@/assets/flags/cn.png";
import jpFlag from "@/assets/flags/jp.png";
import krFlag from "@/assets/flags/kr.png";
import saFlag from "@/assets/flags/sa.png";
import inFlag from "@/assets/flags/in.png";
import nlFlag from "@/assets/flags/nl.png";
import plFlag from "@/assets/flags/pl.png";
import trFlag from "@/assets/flags/tr.png";
import vnFlag from "@/assets/flags/vn.png";
import thFlag from "@/assets/flags/th.png";
import seFlag from "@/assets/flags/se.png";
import noFlag from "@/assets/flags/no.png";
import dkFlag from "@/assets/flags/dk.png";
import fiFlag from "@/assets/flags/fi.png";
import grFlag from "@/assets/flags/gr.png";
import czFlag from "@/assets/flags/cz.png";
import huFlag from "@/assets/flags/hu.png";
import roFlag from "@/assets/flags/ro.png";
import uaFlag from "@/assets/flags/ua.png";
import ilFlag from "@/assets/flags/il.png";
import myFlag from "@/assets/flags/my.png";
import phFlag from "@/assets/flags/ph.png";
import mxFlag from "@/assets/flags/mx.png";

const flagMap: Record<string, string> = {
  en: usFlag, id: idFlag, es: esFlag, fr: frFlag, de: deFlag, it: itFlag,
  pt: ptFlag, br: brFlag, ru: ruFlag, cn: cnFlag, jp: jpFlag, kr: krFlag,
  sa: saFlag, in: inFlag, nl: nlFlag, pl: plFlag, tr: trFlag, vn: vnFlag,
  th: thFlag, se: seFlag, no: noFlag, dk: dkFlag, fi: fiFlag, gr: grFlag,
  cz: czFlag, hu: huFlag, ro: roFlag, ua: uaFlag, il: ilFlag, my: myFlag,
  ph: phFlag, mx: mxFlag,
};
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const isHomePage = location.pathname === "/";
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { communityUnread, directUnread } = useUnreadCounts();
  
  const currentLogo = theme === 'dark' ? logoWhite : logo;

  const filteredLanguages = Object.entries(languageNames).filter(([code, name]) => 
    name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    code.toLowerCase().includes(languageSearch.toLowerCase())
  );
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
          <button onClick={() => navigate("/lessons")} className="text-foreground hover:text-primary transition-colors px-3">
            Lessons
          </button>
          
          <DropdownMenu onOpenChange={(open) => !open && setLanguageSearch("")}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <img src={flagMap[language]} alt={languageNames[language]} className="h-5 w-5 rounded" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-sm">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search languages..."
                    value={languageSearch}
                    onChange={(e) => setLanguageSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <ScrollArea className="h-[300px]">
                {filteredLanguages.map(([code, name]) => (
                  <DropdownMenuItem 
                    key={code}
                    onClick={() => {
                      setLanguage(code as any);
                      setLanguageSearch("");
                    }} 
                    className="gap-2 cursor-pointer"
                  >
                    <img src={flagMap[code]} alt={name} className="h-5 w-5 rounded" />
                    <span>{name}</span>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <User className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate("/friends")}>
            <UserPlus className="h-5 w-5" />
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
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
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/messages")} className="cursor-pointer">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Direct Messages</span>
                {directUnread > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {directUnread > 9 ? "9+" : directUnread}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/status")} className="cursor-pointer">
                <Clock className="h-4 w-4 mr-2" />
                <span>Status</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/groups")} className="cursor-pointer">
                <Shield className="h-4 w-4 mr-2" />
                <span>Grup</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
            <button onClick={() => { navigate("/lessons"); setIsMobileMenuOpen(false); }} className="text-left text-foreground hover:text-primary transition-colors">
              Lessons
            </button>
            
            <div className="space-y-2">
              <DropdownMenu onOpenChange={(open) => !open && setLanguageSearch("")}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <img src={flagMap[language]} alt={languageNames[language]} className="h-4 w-4 mr-2 rounded" />
                    {languageNames[language]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 bg-background/95 backdrop-blur-sm">
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search languages..."
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {filteredLanguages.map(([code, name]) => (
                      <DropdownMenuItem 
                        key={code}
                        onClick={() => {
                          setLanguage(code as any);
                          setLanguageSearch("");
                        }} 
                        className="gap-2 cursor-pointer"
                      >
                        <img src={flagMap[code]} alt={name} className="h-5 w-5 rounded" />
                        <span>{name}</span>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="w-full">
                {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>

            <Button onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }} variant="outline" className="w-full">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>

            <Button onClick={() => { navigate("/friends"); setIsMobileMenuOpen(false); }} variant="outline" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Friends
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full relative">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages & More
                  {directUnread > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {directUnread > 9 ? "9+" : directUnread}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem onClick={() => { navigate("/messages"); setIsMobileMenuOpen(false); }} className="cursor-pointer">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Direct Messages</span>
                  {directUnread > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {directUnread > 9 ? "9+" : directUnread}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate("/status"); setIsMobileMenuOpen(false); }} className="cursor-pointer">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Status</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate("/groups"); setIsMobileMenuOpen(false); }} className="cursor-pointer">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Grup</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => navigate("/chat")} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
              {t('nav.chat')}
            </Button>
          </div>
        </div>}
    </nav>;
};
export default Navbar;