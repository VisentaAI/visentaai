import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'br' | 'ru' | 'cn' | 'jp' | 'kr' | 'sa' | 'in' | 'nl' | 'pl' | 'tr' | 'vn' | 'th' | 'se' | 'no' | 'dk' | 'fi' | 'gr' | 'cz' | 'hu' | 'ro' | 'ua' | 'il' | 'my' | 'ph' | 'mx';

export const languageNames: Record<Language, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  br: 'Português (Brasil)',
  ru: 'Русский',
  cn: '中文',
  jp: '日本語',
  kr: '한국어',
  sa: 'العربية',
  in: 'हिन्दी',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
  vn: 'Tiếng Việt',
  th: 'ภาษาไทย',
  se: 'Svenska',
  no: 'Norsk',
  dk: 'Dansk',
  fi: 'Suomi',
  gr: 'Ελληνικά',
  cz: 'Čeština',
  hu: 'Magyar',
  ro: 'Română',
  ua: 'Українська',
  il: 'עברית',
  my: 'Bahasa Melayu',
  ph: 'Filipino',
  mx: 'Español (México)',
};

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
  es: {
    'nav.home': 'Inicio', 'nav.features': 'Características', 'nav.about': 'Acerca de', 'nav.testimonials': 'Testimonios', 'nav.chat': 'Chat IA',
    'hero.badge': 'Plataforma Líder de Aprendizaje con IA', 'hero.title': 'Aprende Más Inteligente con', 'hero.description': 'Plataforma de aprendizaje impulsada por IA que se adapta a tu estilo de aprendizaje.',
    'hero.cta.start': 'Comenzar Ahora', 'hero.cta.features': 'Explorar Características', 'features.title': 'Características', 'profile': 'Perfil', 'signOut': 'Cerrar Sesión',
  },
  mx: {
    'nav.home': 'Inicio', 'nav.features': 'Características', 'nav.about': 'Acerca de', 'nav.testimonials': 'Testimonios', 'nav.chat': 'Chat IA',
    'hero.badge': 'Plataforma Líder de Aprendizaje con IA', 'hero.title': 'Aprende Más Inteligente con', 'hero.description': 'Plataforma de aprendizaje impulsada por IA que se adapta a tu estilo de aprendizaje.',
    'hero.cta.start': 'Comenzar Ahora', 'hero.cta.features': 'Explorar Características', 'features.title': 'Características', 'profile': 'Perfil', 'signOut': 'Cerrar Sesión',
  },
  fr: {
    'nav.home': 'Accueil', 'nav.features': 'Fonctionnalités', 'nav.about': 'À propos', 'nav.testimonials': 'Témoignages', 'nav.chat': 'Chat IA',
    'hero.badge': 'Plateforme d\'Apprentissage IA de Premier Plan', 'hero.title': 'Apprenez Plus Intelligemment avec', 'hero.description': 'Plateforme d\'apprentissage alimentée par l\'IA qui s\'adapte à votre style d\'apprentissage.',
    'hero.cta.start': 'Commencer Maintenant', 'hero.cta.features': 'Explorer les Fonctionnalités', 'features.title': 'Fonctionnalités', 'profile': 'Profil', 'signOut': 'Se Déconnecter',
  },
  de: {
    'nav.home': 'Startseite', 'nav.features': 'Funktionen', 'nav.about': 'Über uns', 'nav.testimonials': 'Erfahrungsberichte', 'nav.chat': 'KI-Chat',
    'hero.badge': 'Führende KI-Lernplattform', 'hero.title': 'Lernen Sie Intelligenter mit', 'hero.description': 'KI-gestützte Lernplattform, die sich Ihrem Lernstil anpasst.',
    'hero.cta.start': 'Jetzt Starten', 'hero.cta.features': 'Funktionen Erkunden', 'features.title': 'Funktionen', 'profile': 'Profil', 'signOut': 'Abmelden',
  },
  it: {
    'nav.home': 'Home', 'nav.features': 'Caratteristiche', 'nav.about': 'Chi Siamo', 'nav.testimonials': 'Testimonianze', 'nav.chat': 'Chat IA',
    'hero.badge': 'Piattaforma di Apprendimento IA Leader', 'hero.title': 'Impara in Modo Più Intelligente con', 'hero.description': 'Piattaforma di apprendimento basata sull\'IA che si adatta al tuo stile di apprendimento.',
    'hero.cta.start': 'Inizia Ora', 'hero.cta.features': 'Esplora le Caratteristiche', 'features.title': 'Caratteristiche', 'profile': 'Profilo', 'signOut': 'Esci',
  },
  pt: {
    'nav.home': 'Início', 'nav.features': 'Recursos', 'nav.about': 'Sobre', 'nav.testimonials': 'Depoimentos', 'nav.chat': 'Chat IA',
    'hero.badge': 'Plataforma Líder de Aprendizagem com IA', 'hero.title': 'Aprenda de Forma Mais Inteligente com', 'hero.description': 'Plataforma de aprendizagem alimentada por IA que se adapta ao seu estilo de aprendizagem.',
    'hero.cta.start': 'Começar Agora', 'hero.cta.features': 'Explorar Recursos', 'features.title': 'Recursos', 'profile': 'Perfil', 'signOut': 'Sair',
  },
  br: {
    'nav.home': 'Início', 'nav.features': 'Recursos', 'nav.about': 'Sobre', 'nav.testimonials': 'Depoimentos', 'nav.chat': 'Chat IA',
    'hero.badge': 'Plataforma Líder de Aprendizagem com IA', 'hero.title': 'Aprenda de Forma Mais Inteligente com', 'hero.description': 'Plataforma de aprendizagem alimentada por IA que se adapta ao seu estilo de aprendizagem.',
    'hero.cta.start': 'Começar Agora', 'hero.cta.features': 'Explorar Recursos', 'features.title': 'Recursos', 'profile': 'Perfil', 'signOut': 'Sair',
  },
  ru: {
    'nav.home': 'Главная', 'nav.features': 'Функции', 'nav.about': 'О нас', 'nav.testimonials': 'Отзывы', 'nav.chat': 'ИИ Чат',
    'hero.badge': 'Ведущая Платформа Обучения с ИИ', 'hero.title': 'Учитесь Умнее с', 'hero.description': 'Платформа обучения на основе ИИ, которая адаптируется к вашему стилю обучения.',
    'hero.cta.start': 'Начать Сейчас', 'hero.cta.features': 'Изучить Функции', 'features.title': 'Функции', 'profile': 'Профиль', 'signOut': 'Выйти',
  },
  cn: {
    'nav.home': '首页', 'nav.features': '功能', 'nav.about': '关于', 'nav.testimonials': '评价', 'nav.chat': 'AI 聊天',
    'hero.badge': '领先的AI学习平台', 'hero.title': '更智能地学习', 'hero.description': '基于AI的学习平台，适应您的学习风格。',
    'hero.cta.start': '立即开始', 'hero.cta.features': '探索功能', 'features.title': '功能', 'profile': '个人资料', 'signOut': '退出',
  },
  jp: {
    'nav.home': 'ホーム', 'nav.features': '機能', 'nav.about': '概要', 'nav.testimonials': 'お客様の声', 'nav.chat': 'AIチャット',
    'hero.badge': '最先端のAI学習プラットフォーム', 'hero.title': 'よりスマートに学ぶ', 'hero.description': 'あなたの学習スタイルに適応するAI駆動の学習プラットフォーム。',
    'hero.cta.start': '今すぐ始める', 'hero.cta.features': '機能を探索', 'features.title': '機能', 'profile': 'プロフィール', 'signOut': 'ログアウト',
  },
  kr: {
    'nav.home': '홈', 'nav.features': '기능', 'nav.about': '소개', 'nav.testimonials': '후기', 'nav.chat': 'AI 채팅',
    'hero.badge': '선도적인 AI 학습 플랫폼', 'hero.title': '더 스마트하게 학습하기', 'hero.description': '학습 스타일에 맞춰 조정되는 AI 기반 학습 플랫폼.',
    'hero.cta.start': '지금 시작', 'hero.cta.features': '기능 탐색', 'features.title': '기능', 'profile': '프로필', 'signOut': '로그아웃',
  },
  sa: {
    'nav.home': 'الرئيسية', 'nav.features': 'الميزات', 'nav.about': 'عن', 'nav.testimonials': 'الشهادات', 'nav.chat': 'دردشة الذكاء الاصطناعي',
    'hero.badge': 'منصة التعلم الرائدة بالذكاء الاصطناعي', 'hero.title': 'تعلم بذكاء أكبر مع', 'hero.description': 'منصة تعلم مدعومة بالذكاء الاصطناعي تتكيف مع أسلوب تعلمك.',
    'hero.cta.start': 'ابدأ الآن', 'hero.cta.features': 'استكشف الميزات', 'features.title': 'الميزات', 'profile': 'الملف الشخصي', 'signOut': 'تسجيل الخروج',
  },
  in: {
    'nav.home': 'होम', 'nav.features': 'विशेषताएं', 'nav.about': 'के बारे में', 'nav.testimonials': 'प्रशंसापत्र', 'nav.chat': 'एआई चैट',
    'hero.badge': 'अग्रणी एआई शिक्षण मंच', 'hero.title': 'स्मार्ट तरीके से सीखें', 'hero.description': 'एआई-संचालित शिक्षण मंच जो आपकी सीखने की शैली के अनुकूल है।',
    'hero.cta.start': 'अभी शुरू करें', 'hero.cta.features': 'विशेषताएं देखें', 'features.title': 'विशेषताएं', 'profile': 'प्रोफाइल', 'signOut': 'साइन आउट',
  },
  nl: {
    'nav.home': 'Home', 'nav.features': 'Functies', 'nav.about': 'Over', 'nav.testimonials': 'Getuigenissen', 'nav.chat': 'AI Chat',
    'hero.badge': 'Leidend AI-leerplatform', 'hero.title': 'Leer Slimmer met', 'hero.description': 'AI-aangedreven leerplatform dat zich aanpast aan jouw leerstijl.',
    'hero.cta.start': 'Nu Beginnen', 'hero.cta.features': 'Functies Verkennen', 'features.title': 'Functies', 'profile': 'Profiel', 'signOut': 'Uitloggen',
  },
  pl: {
    'nav.home': 'Strona główna', 'nav.features': 'Funkcje', 'nav.about': 'O nas', 'nav.testimonials': 'Opinie', 'nav.chat': 'Czat AI',
    'hero.badge': 'Wiodąca Platforma Nauki AI', 'hero.title': 'Ucz się Mądrzej z', 'hero.description': 'Platforma edukacyjna oparta na AI, która dostosowuje się do Twojego stylu nauki.',
    'hero.cta.start': 'Zacznij Teraz', 'hero.cta.features': 'Poznaj Funkcje', 'features.title': 'Funkcje', 'profile': 'Profil', 'signOut': 'Wyloguj',
  },
  tr: {
    'nav.home': 'Ana Sayfa', 'nav.features': 'Özellikler', 'nav.about': 'Hakkında', 'nav.testimonials': 'Referanslar', 'nav.chat': 'Yapay Zeka Sohbeti',
    'hero.badge': 'Önde Gelen Yapay Zeka Öğrenme Platformu', 'hero.title': 'Daha Akıllıca Öğren', 'hero.description': 'Öğrenme tarzınıza uyum sağlayan yapay zeka destekli öğrenme platformu.',
    'hero.cta.start': 'Şimdi Başla', 'hero.cta.features': 'Özellikleri Keşfet', 'features.title': 'Özellikler', 'profile': 'Profil', 'signOut': 'Çıkış Yap',
  },
  vn: {
    'nav.home': 'Trang chủ', 'nav.features': 'Tính năng', 'nav.about': 'Giới thiệu', 'nav.testimonials': 'Đánh giá', 'nav.chat': 'Trò chuyện AI',
    'hero.badge': 'Nền tảng Học tập AI Hàng đầu', 'hero.title': 'Học Thông minh hơn với', 'hero.description': 'Nền tảng học tập được hỗ trợ bởi AI thích ứng với phong cách học tập của bạn.',
    'hero.cta.start': 'Bắt đầu Ngay', 'hero.cta.features': 'Khám phá Tính năng', 'features.title': 'Tính năng', 'profile': 'Hồ sơ', 'signOut': 'Đăng xuất',
  },
  th: {
    'nav.home': 'หน้าหลัก', 'nav.features': 'คุณสมบัติ', 'nav.about': 'เกี่ยวกับ', 'nav.testimonials': 'คำรับรอง', 'nav.chat': 'แชท AI',
    'hero.badge': 'แพลตฟอร์มการเรียนรู้ AI ชั้นนำ', 'hero.title': 'เรียนรู้อย่างชาญฉลาดกับ', 'hero.description': 'แพลตฟอร์มการเรียนรู้ที่ขับเคลื่อนด้วย AI ที่ปรับให้เข้ากับรูปแบบการเรียนรู้ของคุณ',
    'hero.cta.start': 'เริ่มตอนนี้', 'hero.cta.features': 'สำรวจคุณสมบัติ', 'features.title': 'คุณสมบัติ', 'profile': 'โปรไฟล์', 'signOut': 'ออกจากระบบ',
  },
  se: {
    'nav.home': 'Hem', 'nav.features': 'Funktioner', 'nav.about': 'Om', 'nav.testimonials': 'Omdömen', 'nav.chat': 'AI-chatt',
    'hero.badge': 'Ledande AI-inlärningsplattform', 'hero.title': 'Lär dig Smartare med', 'hero.description': 'AI-driven inlärningsplattform som anpassar sig till din inlärningsstil.',
    'hero.cta.start': 'Börja Nu', 'hero.cta.features': 'Utforska Funktioner', 'features.title': 'Funktioner', 'profile': 'Profil', 'signOut': 'Logga ut',
  },
  no: {
    'nav.home': 'Hjem', 'nav.features': 'Funksjoner', 'nav.about': 'Om', 'nav.testimonials': 'Anmeldelser', 'nav.chat': 'AI-chat',
    'hero.badge': 'Ledende AI-læringsplattform', 'hero.title': 'Lær Smartere med', 'hero.description': 'AI-drevet læringsplattform som tilpasser seg din læringsstil.',
    'hero.cta.start': 'Begynn Nå', 'hero.cta.features': 'Utforsk Funksjoner', 'features.title': 'Funksjoner', 'profile': 'Profil', 'signOut': 'Logg ut',
  },
  dk: {
    'nav.home': 'Hjem', 'nav.features': 'Funktioner', 'nav.about': 'Om', 'nav.testimonials': 'Anmeldelser', 'nav.chat': 'AI-chat',
    'hero.badge': 'Førende AI-læringsplatform', 'hero.title': 'Lær Smartere med', 'hero.description': 'AI-drevet læringsplatform, der tilpasser sig din læringsstil.',
    'hero.cta.start': 'Begynd Nu', 'hero.cta.features': 'Udforsk Funktioner', 'features.title': 'Funktioner', 'profile': 'Profil', 'signOut': 'Log ud',
  },
  fi: {
    'nav.home': 'Etusivu', 'nav.features': 'Ominaisuudet', 'nav.about': 'Tietoa', 'nav.testimonials': 'Arvostelut', 'nav.chat': 'AI-chatti',
    'hero.badge': 'Johtava tekoälyoppimisalusta', 'hero.title': 'Opi Älykkäämmin', 'hero.description': 'Tekoälypohjainen oppimisalusta, joka mukautuu oppimistyyliisi.',
    'hero.cta.start': 'Aloita Nyt', 'hero.cta.features': 'Tutustu Ominaisuuksiin', 'features.title': 'Ominaisuudet', 'profile': 'Profiili', 'signOut': 'Kirjaudu ulos',
  },
  gr: {
    'nav.home': 'Αρχική', 'nav.features': 'Χαρακτηριστικά', 'nav.about': 'Σχετικά', 'nav.testimonials': 'Μαρτυρίες', 'nav.chat': 'Συνομιλία AI',
    'hero.badge': 'Κορυφαία Πλατφόρμα Μάθησης AI', 'hero.title': 'Μάθετε Εξυπνότερα με', 'hero.description': 'Πλατφόρμα μάθησης με τεχνητή νοημοσύνη που προσαρμόζεται στο στυλ μάθησής σας.',
    'hero.cta.start': 'Ξεκινήστε Τώρα', 'hero.cta.features': 'Εξερευνήστε Χαρακτηριστικά', 'features.title': 'Χαρακτηριστικά', 'profile': 'Προφίλ', 'signOut': 'Αποσύνδεση',
  },
  cz: {
    'nav.home': 'Domů', 'nav.features': 'Funkce', 'nav.about': 'O nás', 'nav.testimonials': 'Recenze', 'nav.chat': 'AI chat',
    'hero.badge': 'Vedoucí platforma AI učení', 'hero.title': 'Učte se Chytřeji s', 'hero.description': 'Platforma učení poháněná umělou inteligencí, která se přizpůsobuje vašemu stylu učení.',
    'hero.cta.start': 'Začít Nyní', 'hero.cta.features': 'Prozkoumat Funkce', 'features.title': 'Funkce', 'profile': 'Profil', 'signOut': 'Odhlásit se',
  },
  hu: {
    'nav.home': 'Kezdőlap', 'nav.features': 'Funkciók', 'nav.about': 'Rólunk', 'nav.testimonials': 'Vélemények', 'nav.chat': 'AI csevegés',
    'hero.badge': 'Vezető AI tanulási platform', 'hero.title': 'Tanulj Okosabban', 'hero.description': 'AI-alapú tanulási platform, amely alkalmazkodik a tanulási stílusodhoz.',
    'hero.cta.start': 'Kezdj Hozzá Most', 'hero.cta.features': 'Funkciók Felfedezése', 'features.title': 'Funkciók', 'profile': 'Profil', 'signOut': 'Kijelentkezés',
  },
  ro: {
    'nav.home': 'Acasă', 'nav.features': 'Caracteristici', 'nav.about': 'Despre', 'nav.testimonials': 'Mărturii', 'nav.chat': 'Chat AI',
    'hero.badge': 'Platformă Lider de Învățare AI', 'hero.title': 'Învață Mai Inteligent cu', 'hero.description': 'Platformă de învățare alimentată de AI care se adaptează stilului tău de învățare.',
    'hero.cta.start': 'Începe Acum', 'hero.cta.features': 'Explorează Caracteristicile', 'features.title': 'Caracteristici', 'profile': 'Profil', 'signOut': 'Deconectare',
  },
  ua: {
    'nav.home': 'Головна', 'nav.features': 'Функції', 'nav.about': 'Про нас', 'nav.testimonials': 'Відгуки', 'nav.chat': 'AI чат',
    'hero.badge': 'Провідна платформа навчання з ШІ', 'hero.title': 'Вчіться Розумніше з', 'hero.description': 'Платформа навчання на основі ШІ, яка адаптується до вашого стилю навчання.',
    'hero.cta.start': 'Почати Зараз', 'hero.cta.features': 'Дослідити Функції', 'features.title': 'Функції', 'profile': 'Профіль', 'signOut': 'Вийти',
  },
  il: {
    'nav.home': 'בית', 'nav.features': 'תכונות', 'nav.about': 'אודות', 'nav.testimonials': 'המלצות', 'nav.chat': 'צ\'אט AI',
    'hero.badge': 'פלטפורמת למידה מובילה בבינה מלאכותית', 'hero.title': 'למד בצורה חכמה יותר עם', 'hero.description': 'פלטפורמת למידה מונעת בינה מלאכותית המתאימה את עצמה לסגנון הלמידה שלך.',
    'hero.cta.start': 'התחל עכשיו', 'hero.cta.features': 'חקור תכונות', 'features.title': 'תכונות', 'profile': 'פרופיל', 'signOut': 'התנתק',
  },
  my: {
    'nav.home': 'Laman Utama', 'nav.features': 'Ciri-ciri', 'nav.about': 'Tentang', 'nav.testimonials': 'Testimoni', 'nav.chat': 'Sembang AI',
    'hero.badge': 'Platform Pembelajaran AI Terkemuka', 'hero.title': 'Belajar Lebih Bijak dengan', 'hero.description': 'Platform pembelajaran berkuasa AI yang menyesuaikan dengan gaya pembelajaran anda.',
    'hero.cta.start': 'Mula Sekarang', 'hero.cta.features': 'Terokai Ciri-ciri', 'features.title': 'Ciri-ciri', 'profile': 'Profil', 'signOut': 'Log Keluar',
  },
  ph: {
    'nav.home': 'Home', 'nav.features': 'Mga Feature', 'nav.about': 'Tungkol', 'nav.testimonials': 'Mga Testimonial', 'nav.chat': 'AI Chat',
    'hero.badge': 'Nangunguna na AI Learning Platform', 'hero.title': 'Mag-aral nang Mas Matalino gamit ang', 'hero.description': 'AI-powered na learning platform na umaangkop sa iyong estilo ng pag-aaral.',
    'hero.cta.start': 'Magsimula Ngayon', 'hero.cta.features': 'I-explore ang Mga Feature', 'features.title': 'Mga Feature', 'profile': 'Profile', 'signOut': 'Mag-sign Out',
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
