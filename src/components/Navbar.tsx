import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = location.pathname === "/";
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
          <img src={logo} alt="VisentaAI Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold gradient-text">VisentaAI</span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => scrollToSection("home")} className="text-foreground hover:text-primary transition-colors">
            Home
          </button>
          <button onClick={() => scrollToSection("features")} className="text-foreground hover:text-primary transition-colors">
            Fitur
          </button>
          <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-primary transition-colors">
            Tentang
          </button>
          <button onClick={() => scrollToSection("testimonials")} className="text-foreground hover:text-primary transition-colors">
            Testimoni
          </button>
          <Button onClick={() => navigate("/chat")} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Chat AI
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
              Home
            </button>
            <button onClick={() => scrollToSection("features")} className="text-left text-foreground hover:text-primary transition-colors">
              Fitur
            </button>
            <button onClick={() => scrollToSection("about")} className="text-left text-foreground hover:text-primary transition-colors">
              Tentang
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-left text-foreground hover:text-primary transition-colors">
              Testimoni
            </button>
            <Button onClick={() => navigate("/chat")} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 w-full">
              Chat AI
            </Button>
          </div>
        </div>}
    </nav>;
};
export default Navbar;