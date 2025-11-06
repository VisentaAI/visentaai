import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
      setIsMobileMenuOpen(false);
    }
  };
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass shadow-md" : "bg-transparent"}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            
          </div>
          <span className="text-2xl font-bold gradient-text">VisentaAI</span>
        </div>

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
          <button onClick={() => scrollToSection("demo")} className="text-foreground hover:text-primary transition-colors">
            Demo
          </button>
          <button onClick={() => scrollToSection("testimonials")} className="text-foreground hover:text-primary transition-colors">
            Testimoni
          </button>
          <Button onClick={() => scrollToSection("demo")} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Mulai Sekarang
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
            <button onClick={() => scrollToSection("demo")} className="text-left text-foreground hover:text-primary transition-colors">
              Demo
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-left text-foreground hover:text-primary transition-colors">
              Testimoni
            </button>
            <Button onClick={() => scrollToSection("demo")} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 w-full">
              Mulai Sekarang
            </Button>
          </div>
        </div>}
    </nav>;
};
export default Navbar;