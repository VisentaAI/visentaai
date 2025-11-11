import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Phone, Clock, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Support = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Pesan Terkirim!",
      description: "Tim support kami akan segera menghubungi Anda.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const supportChannels = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Kirim email kepada kami",
      contact: "hello@visentaai.com",
      response: "Respon dalam 24 jam"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat langsung dengan tim kami",
      contact: "Chat tersedia 24/7",
      response: "Respon instan"
    },
    {
      icon: Phone,
      title: "Telepon",
      description: "Hubungi kami melalui telepon",
      contact: "+62 XXX-XXXX-XXXX",
      response: "Senin - Jumat, 09:00 - 17:00"
    }
  ];

  return (
    <div className="min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Support
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tim kami siap membantu Anda dengan segala pertanyaan dan kendala
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="glass hover-lift text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <channel.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{channel.title}</CardTitle>
                  <CardDescription>{channel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-foreground mb-2">{channel.contact}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{channel.response}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-2xl">Kirim Pesan</CardTitle>
                <CardDescription>
                  Isi form di bawah ini dan kami akan segera menghubungi Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="glass"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="glass"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Apa yang ingin Anda tanyakan?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="glass"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Jelaskan pertanyaan atau masalah Anda..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="glass min-h-[150px]"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-2xl">Jam Operasional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Senin - Jumat</span>
                    <span className="font-semibold">09:00 - 17:00 WIB</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Sabtu</span>
                    <span className="font-semibold">09:00 - 14:00 WIB</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Minggu</span>
                    <span className="font-semibold">Tutup</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Respon Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Untuk pertanyaan umum dan bantuan cepat, kunjungi halaman FAQ kami terlebih dahulu.
                  </p>
                  <Button variant="outline" className="w-full">
                    Lihat FAQ
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-2xl">Lokasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Indonesia<br />
                    Indonesia
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;
