import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.testimonials': 'Testimonials',
    'nav.chat': 'AI Chat',
    
    // Hero
    'hero.badge': 'Leading AI Learning Platform',
    'hero.title': 'Learn Smarter with',
    'hero.description': 'AI-powered learning platform that adapts to your learning style. Personal, interactive, and effective learning experience for your future.',
    'hero.cta.start': 'Start Learning Now',
    'hero.cta.features': 'Explore Features',
    'hero.stats.users': 'Active Users',
    'hero.stats.courses': 'AI Courses',
    'hero.stats.satisfaction': 'Satisfaction',
    
    // Features
    'features.title': 'Features',
    'features.subtitle': 'Cutting-edge AI technology designed to maximize your learning experience',
    'features.adaptive.title': 'Adaptive Learning',
    'features.adaptive.desc': 'AI that adjusts content to your learning style and pace in real-time.',
    'features.personalization.title': 'Full Personalization',
    'features.personalization.desc': 'Learning paths designed specifically based on your goals and abilities.',
    'features.feedback.title': 'Instant Feedback',
    'features.feedback.desc': 'Get immediate corrections and suggestions from AI to accelerate your understanding.',
    'features.community.title': 'Collaborative Community',
    'features.community.desc': 'Learn with thousands of other students and share learning experiences.',
    'features.analytics.title': 'Progress Analytics',
    'features.analytics.desc': 'Track your learning progress with detailed and easy-to-understand data visualization.',
    'features.security.title': 'Guaranteed Security',
    'features.security.desc': 'Your data and privacy are protected with enterprise-level encryption.',
    
    // About
    'about.title': 'About',
    'about.desc1': 'VisentaAI is a revolutionary AI-powered learning platform, developed to make education more personal, effective, and accessible to everyone.',
    'about.desc2': 'We believe everyone learns differently. With cutting-edge AI technology, we deliver a learning experience truly tailored to each individual\'s unique needs.',
    'about.benefit1': 'Latest AI technology from leading research',
    'about.benefit2': 'Curriculum designed by education experts',
    'about.benefit3': 'Regular content updates following technology developments',
    'about.benefit4': 'Industry-recognized certificates',
    'about.partners': 'Partner Institutions',
    'about.support': 'AI Support',
    'about.languages': 'Languages',
    'about.possibilities': 'Possibilities',
    
    // Testimonials
    'testimonials.title': 'What',
    'testimonials.title2': 'They Say',
    'testimonials.subtitle': 'Thousands of learners have experienced transformation in their learning with VisentaAI',
    
    // Footer
    'footer.description': 'Revolutionary AI-powered learning platform for a smarter future of education.',
    'footer.founder': 'Founder & CEO',
    'footer.navigation': 'Navigation',
    'footer.resources': 'Resources',
    'footer.contact': 'Contact',
    'footer.blog': 'Blog',
    'footer.documentation': 'Documentation',
    'footer.tutorial': 'Tutorial',
    'footer.faq': 'FAQ',
    'footer.support': 'Support',
    'footer.rights': 'All rights reserved.',
    
    // Tutorial
    'tutorial.welcome': 'Welcome to VisentaAI!',
    'tutorial.welcome.desc': 'Let\'s take a quick tour of the platform.',
    'tutorial.features': 'Explore Features',
    'tutorial.features.desc': 'Discover powerful AI-powered learning tools.',
    'tutorial.chat': 'Chat with AI',
    'tutorial.chat.desc': 'Get instant help and personalized learning assistance.',
    'tutorial.start': 'Start Learning',
    'tutorial.start.desc': 'Begin your learning journey with AI-powered courses.',
    'tutorial.skip': 'Skip',
    'tutorial.next': 'Next',
    'tutorial.finish': 'Get Started',
    
    // Profile
    'profile': 'Profile',
    'backHome': 'Back to Home',
    'learningStats': 'Learning Statistics',
    'completedLessons': 'Completed Lessons',
    'currentStreak': 'Current Streak',
    'days': 'days',
    'progress': 'Progress',
    'settings': 'Settings',
    'profileInfo': 'Profile',
    'accountSettings': 'Account Settings',
    'managePreferences': 'Manage your account preferences',
    'language': 'Language',
    'theme': 'Theme',
    'light': 'Light',
    'dark': 'Dark',
    'notifications': 'Notifications',
    'receiveNotifications': 'Receive email notifications',
    'saveSettings': 'Save Settings',
    'signOut': 'Sign Out',
    'profileInformation': 'Profile Information',
    'updateYourProfile': 'Update your personal information',
    'fullName': 'Full Name',
    'email': 'Email',
    'bio': 'Bio',
    'enterFullName': 'Enter your full name',
    'tellUsAboutYourself': 'Tell us about yourself',
    'updateProfile': 'Update Profile',
    
    // Community
    'community.title': 'Community Chat',
    'community.chat': 'Live Chat',
    'community.description': 'Share your learning experiences with other learners',
    'community.activeUsers': 'active users',
    'community.you': 'You',
    'community.typePlaceholder': 'Type your message...',
    
    // Direct Messages
    'dm.title': 'Direct Messages',
    'dm.newChat': 'New Chat',
    'dm.startNewChat': 'Start New Chat',
    'dm.searchUsers': 'Search users...',
    'dm.noConversations': 'No conversations yet. Start a new chat!',
    'dm.selectConversation': 'Select a conversation to start messaging',
    'dm.typePlaceholder': 'Type a message...',
  },
  id: {
    // Navbar
    'nav.home': 'Home',
    'nav.features': 'Fitur',
    'nav.about': 'Tentang',
    'nav.testimonials': 'Testimoni',
    'nav.chat': 'Chat AI',
    
    // Hero
    'hero.badge': 'Platform Pembelajaran AI Terdepan',
    'hero.title': 'Belajar Lebih Cerdas dengan',
    'hero.description': 'Platform pembelajaran berbasis AI yang mengadaptasi gaya belajar Anda. Pengalaman belajar yang personal, interaktif, dan efektif untuk masa depan Anda.',
    'hero.cta.start': 'Mulai Belajar Sekarang',
    'hero.cta.features': 'Pelajari Fitur',
    'hero.stats.users': 'Pengguna Aktif',
    'hero.stats.courses': 'Kursus AI',
    'hero.stats.satisfaction': 'Kepuasan',
    
    // Features
    'features.title': 'Fitur',
    'features.subtitle': 'Teknologi AI terdepan yang dirancang untuk memaksimalkan pengalaman belajar Anda',
    'features.adaptive.title': 'Pembelajaran Adaptif',
    'features.adaptive.desc': 'AI yang menyesuaikan konten dengan gaya belajar dan kecepatan Anda secara real-time.',
    'features.personalization.title': 'Personalisasi Penuh',
    'features.personalization.desc': 'Jalur pembelajaran yang dirancang khusus berdasarkan tujuan dan kemampuan Anda.',
    'features.feedback.title': 'Feedback Instan',
    'features.feedback.desc': 'Dapatkan koreksi dan saran langsung dari AI untuk mempercepat pemahaman Anda.',
    'features.community.title': 'Komunitas Kolaboratif',
    'features.community.desc': 'Belajar bersama ribuan pelajar lain dan berbagi pengalaman belajar.',
    'features.analytics.title': 'Analitik Progress',
    'features.analytics.desc': 'Lacak perkembangan belajar Anda dengan visualisasi data yang detail dan mudah dipahami.',
    'features.security.title': 'Keamanan Terjamin',
    'features.security.desc': 'Data dan privasi Anda dilindungi dengan enkripsi tingkat enterprise.',
    
    // About
    'about.title': 'Tentang',
    'about.desc1': 'VisentaAI adalah platform pembelajaran berbasis AI yang revolusioner, dikembangkan untuk membuat pendidikan lebih personal, efektif, dan accessible bagi semua orang.',
    'about.desc2': 'Kami percaya bahwa setiap orang belajar dengan cara yang berbeda. Dengan teknologi AI terdepan, kami menghadirkan pengalaman belajar yang benar-benar disesuaikan dengan kebutuhan unik setiap individu.',
    'about.benefit1': 'Teknologi AI terbaru dari penelitian terdepan',
    'about.benefit2': 'Kurikulum yang dirancang oleh expert di bidang pendidikan',
    'about.benefit3': 'Update konten regular mengikuti perkembangan teknologi',
    'about.benefit4': 'Sertifikat yang diakui industri',
    'about.partners': 'Mitra Institusi',
    'about.support': 'Support AI',
    'about.languages': 'Bahasa',
    'about.possibilities': 'Kemungkinan',
    
    // Testimonials
    'testimonials.title': 'Apa Kata',
    'testimonials.title2': 'Mereka',
    'testimonials.subtitle': 'Ribuan pelajar telah merasakan transformasi cara belajar mereka dengan VisentaAI',
    
    // Footer
    'footer.description': 'Platform pembelajaran berbasis AI yang revolusioner untuk masa depan pendidikan yang lebih cerdas.',
    'footer.founder': 'Founder & CEO',
    'footer.navigation': 'Navigasi',
    'footer.resources': 'Sumber Daya',
    'footer.contact': 'Kontak',
    'footer.blog': 'Blog',
    'footer.documentation': 'Dokumentasi',
    'footer.tutorial': 'Tutorial',
    'footer.faq': 'FAQ',
    'footer.support': 'Support',
    'footer.rights': 'All rights reserved.',
    
    // Tutorial
    'tutorial.welcome': 'Selamat Datang di VisentaAI!',
    'tutorial.welcome.desc': 'Mari kita jelajahi platform ini bersama.',
    'tutorial.features': 'Jelajahi Fitur',
    'tutorial.features.desc': 'Temukan alat pembelajaran berbasis AI yang powerful.',
    'tutorial.chat': 'Chat dengan AI',
    'tutorial.chat.desc': 'Dapatkan bantuan instan dan pembelajaran personal.',
    'tutorial.start': 'Mulai Belajar',
    'tutorial.start.desc': 'Mulai perjalanan belajar dengan kursus berbasis AI.',
    'tutorial.skip': 'Lewati',
    'tutorial.next': 'Selanjutnya',
    'tutorial.finish': 'Mulai',
    
    // Profile
    'profile': 'Profil',
    'backHome': 'Kembali ke Beranda',
    'learningStats': 'Statistik Pembelajaran',
    'completedLessons': 'Pelajaran Selesai',
    'currentStreak': 'Streak Saat Ini',
    'days': 'hari',
    'progress': 'Progres',
    'settings': 'Pengaturan',
    'profileInfo': 'Profil',
    'accountSettings': 'Pengaturan Akun',
    'managePreferences': 'Kelola preferensi akun Anda',
    'language': 'Bahasa',
    'theme': 'Tema',
    'light': 'Terang',
    'dark': 'Gelap',
    'notifications': 'Notifikasi',
    'receiveNotifications': 'Terima notifikasi email',
    'saveSettings': 'Simpan Pengaturan',
    'signOut': 'Keluar',
    'profileInformation': 'Informasi Profil',
    'updateYourProfile': 'Perbarui informasi pribadi Anda',
    'fullName': 'Nama Lengkap',
    'email': 'Email',
    'bio': 'Bio',
    'enterFullName': 'Masukkan nama lengkap Anda',
    'tellUsAboutYourself': 'Ceritakan tentang diri Anda',
    'updateProfile': 'Perbarui Profil',
    
    // Community
    'community.title': 'Chat Komunitas',
    'community.chat': 'Chat Langsung',
    'community.description': 'Bagikan pengalaman belajar Anda dengan pelajar lain',
    'community.activeUsers': 'pengguna aktif',
    'community.you': 'Anda',
    'community.typePlaceholder': 'Ketik pesan Anda...',
    
    // Direct Messages
    'dm.title': 'Pesan Langsung',
    'dm.newChat': 'Chat Baru',
    'dm.startNewChat': 'Mulai Chat Baru',
    'dm.searchUsers': 'Cari pengguna...',
    'dm.noConversations': 'Belum ada percakapan. Mulai chat baru!',
    'dm.selectConversation': 'Pilih percakapan untuk mulai berkirim pesan',
    'dm.typePlaceholder': 'Ketik pesan...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
