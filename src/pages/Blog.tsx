import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Masa Depan Pendidikan dengan AI",
      excerpt: "Bagaimana kecerdasan buatan mengubah cara kita belajar dan mengajar di era digital.",
      author: "RestuAlfauzi",
      date: "15 Januari 2025",
      category: "Teknologi",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Tips Belajar Efektif dengan AI",
      excerpt: "Strategi dan metode untuk memaksimalkan pembelajaran menggunakan teknologi AI.",
      author: "Tim VisentaAI",
      date: "10 Januari 2025",
      category: "Tutorial",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Personalisasi Pembelajaran: Kunci Sukses",
      excerpt: "Mengapa setiap siswa membutuhkan pendekatan pembelajaran yang unik dan personal.",
      author: "Tim VisentaAI",
      date: "5 Januari 2025",
      category: "Edukasi",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Blog VisentaAI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Artikel, insights, dan update terbaru tentang teknologi AI dalam pendidikan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="glass hover-lift overflow-hidden group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full group/btn">
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
