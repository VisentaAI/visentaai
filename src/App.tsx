import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PresenceProvider } from "@/contexts/PresenceContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Landing from "./pages/Landing";
import Preview from "./pages/Preview";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Dokumentasi from "./pages/Dokumentasi";
import Tutorial from "./pages/Tutorial";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import Chat from "./pages/Chat";
import Lessons from "./pages/Lessons";
import Friends from "./pages/Friends";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import DirectMessages from "./pages/DirectMessages";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import GroupInvite from "./pages/GroupInvite";
import Status from "./pages/Status";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <PresenceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <NotificationProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/dokumentasi" element={<Dokumentasi />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          <Route path="/messages" element={<DirectMessages />} />
          <Route path="/groups" element={<Groups />} />
            <Route path="/group/:groupId" element={<GroupChat />} />
            <Route path="/group-invite" element={<GroupInvite />} />
            <Route path="/status" element={<Status />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
              </NotificationProvider>
            </BrowserRouter>
          </TooltipProvider>
        </PresenceProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
