import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, Loader2, LogOut, Plus, MessageSquare, BookOpen, Calculator, Globe, Headphones, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string;
}

interface Conversation {
  id: string;
  title: string;
  category: string;
  updated_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadConversations("general");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadConversations(activeCategory);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [activeCategory, user]);

  const loadConversations = async (category: string) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .eq("category", category)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    const formattedMessages: Message[] = (data || []).map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      id: msg.id
    }));
    
    setMessages(formattedMessages);
    setCurrentConversation(conversationId);
  };

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        category: activeCategory,
        title: "Percakapan Baru",
      })
      .select()
      .single();

    if (error) {
      toast.error("Gagal membuat percakapan baru");
      return;
    }

    setCurrentConversation(data.id);
    setMessages([]);
    loadConversations(activeCategory);
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      toast.error("Gagal menghapus percakapan");
      return;
    }

    if (currentConversation === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
    
    loadConversations(activeCategory);
    toast.success("Percakapan dihapus");
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const streamChat = async (userMessage: string, conversationId: string) => {
    setIsTyping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: userMessage }],
            conversationId: conversationId,
            category: activeCategory,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mendapat respons dari AI");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "" },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantMessage += content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: assistantMessage,
                    };
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Error parsing chunk:", e);
              }
            }
          }
        }
      }

      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage,
      });

      const titleUpdate = messages.length === 0 ? userMessage.slice(0, 50) : undefined;
      if (titleUpdate) {
        await supabase
          .from("chat_conversations")
          .update({ title: titleUpdate })
          .eq("id", conversationId);
        loadConversations(activeCategory);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat berkomunikasi dengan AI");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user) return;

    let conversationId = currentConversation;

    if (!conversationId) {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          category: activeCategory,
          title: input.slice(0, 50),
        })
        .select()
        .single();

      if (error) {
        toast.error("Gagal membuat percakapan");
        return;
      }

      conversationId = data.id;
      setCurrentConversation(conversationId);
      loadConversations(activeCategory);
    }

    const userMessage = input.trim();
    setInput("");

    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: userMessage,
    });

    if (error) {
      toast.error("Gagal menyimpan pesan");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    await streamChat(userMessage, conversationId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "general":
        return <MessageSquare className="h-4 w-4" />;
      case "math":
        return <Calculator className="h-4 w-4" />;
      case "language":
        return <Globe className="h-4 w-4" />;
      case "science":
        return <BookOpen className="h-4 w-4" />;
      case "support":
        return <Headphones className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "general":
        return "Chat Umum";
      case "math":
        return "Belajar Matematika";
      case "language":
        return "Belajar Bahasa";
      case "science":
        return "Belajar Sains";
      case "support":
        return "Customer Support";
      default:
        return "Chat";
    }
  };

  const getCategoryPrompt = (category: string) => {
    switch (category) {
      case "math":
        return "Tutor matematika siap membantu Anda memahami konsep dan menyelesaikan soal";
      case "language":
        return "Tutor bahasa siap membantu Anda belajar bahasa dengan mudah";
      case "science":
        return "Tutor sains siap menjelaskan konsep fisika, kimia, dan biologi";
      case "support":
        return "Tim support siap membantu melaporkan masalah atau menjawab pertanyaan";
      default:
        return "Asisten AI siap membantu menjawab pertanyaan Anda";
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-lg">VisentaAI</h1>
          </div>
          <Button onClick={createNewConversation} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Percakapan Baru
          </Button>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-2 p-2 gap-1 h-auto shrink-0">
            <TabsTrigger value="general" className="text-xs px-2 py-1.5">
              <MessageSquare className="h-3 w-3 mr-1" />
              Umum
            </TabsTrigger>
            <TabsTrigger value="math" className="text-xs px-2 py-1.5">
              <Calculator className="h-3 w-3 mr-1" />
              Matematika
            </TabsTrigger>
            <TabsTrigger value="language" className="text-xs px-2 py-1.5">
              <Globe className="h-3 w-3 mr-1" />
              Bahasa
            </TabsTrigger>
            <TabsTrigger value="science" className="text-xs px-2 py-1.5">
              <BookOpen className="h-3 w-3 mr-1" />
              Sains
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    currentConversation === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {getCategoryIcon(conv.category)}
                  <span className="flex-1 text-sm truncate">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Tabs>

        <div className="p-4 border-t shrink-0">
          <Button onClick={handleSignOut} variant="outline" className="w-full" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold flex items-center gap-2 truncate">
                {getCategoryIcon(activeCategory)}
                {getCategoryTitle(activeCategory)}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {getCategoryPrompt(activeCategory)}
              </p>
            </div>
            {activeCategory === "support" && (
              <Button variant="outline" size="sm" className="shrink-0">
                <Headphones className="h-4 w-4 mr-2" />
                Hubungi Dev
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Mulai percakapan dengan mengirim pesan</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                )}
                
                <Card className={`max-w-[80%] p-4 shadow-md ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass border border-border/50"
                }`}>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                </Card>
                
                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <Card className="glass border border-border/50 p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-muted/30 shrink-0">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ketik pesan Anda di sini..."
              className="flex-1 text-base"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-12 w-12 shrink-0"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
