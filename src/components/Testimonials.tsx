import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    name: "Sarah Putri",
    role: "Mahasiswa Teknik Informatika",
    content: "VisentaAI benar-benar mengubah cara saya belajar. AI-nya sangat memahami gaya belajar saya dan memberikan materi yang pas!",
    rating: 5,
    avatar: "SP"
  },
  {
    name: "Budi Santoso",
    role: "Data Scientist",
    content: "Platform terbaik untuk upskilling. Kontennya selalu update dan cara penyampaiannya sangat interaktif. Highly recommended!",
    rating: 5,
    avatar: "BS"
  },
  {
    name: "Dina Lestari",
    role: "Product Manager",
    content: "Saya bisa belajar kapan saja dengan kecepatan saya sendiri. Fitur personalisasinya luar biasa membantu!",
    rating: 5,
    avatar: "DL"
  },
  {
    name: "Andi Rahman",
    role: "Software Engineer",
    content: "Feedback dari AI-nya sangat membantu saya memperbaiki kesalahan dengan cepat. Hemat waktu dan efektif!",
    rating: 5,
    avatar: "AR"
  },
  {
    name: "Maya Sari",
    role: "UX Designer",
    content: "Interface-nya beautiful dan intuitif. Belajar jadi lebih enjoyable dengan VisentaAI!",
    rating: 5,
    avatar: "MS"
  },
  {
    name: "Reza Pratama",
    role: "Entrepreneur",
    content: "Investasi terbaik untuk pengembangan diri. ROI-nya luar biasa untuk karir saya!",
    rating: 5,
    avatar: "RP"
  }
];

const Testimonials = () => {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            {t('testimonials.title')} <span className="gradient-text">{t('testimonials.title2')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-muted-foreground leading-relaxed">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
