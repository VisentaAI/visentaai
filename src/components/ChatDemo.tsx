import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya asisten VisentaAI. Saya siap membantu Anda belajar. Apa yang ingin Anda pelajari hari ini?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: userMessages }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Gagal memulai streaming");
      }

      if (!resp.body) throw new Error("Tidak ada response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsTyping(false);
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghubungi AI",
        variant: "destructive",
      });
      // Remove the empty assistant message on error
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await streamChat([...messages, userMessage]);
  };

  return (
    <section id="demo" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Demo <span className="gradient-text">Chat AI</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Coba langsung bagaimana AI kami membantu proses pembelajaran Anda
          </p>
        </div>

        <div className="glass rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-primary to-secondary p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">VisentaAI Assistant</div>
                <div className="text-white/80 text-sm">Selalu siap membantu</div>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-background/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 animate-fade-in ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" 
                    ? "bg-gradient-to-br from-primary to-secondary" 
                    : "bg-muted"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className={`max-w-[75%] rounded-2xl p-4 shadow-md ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-secondary text-white"
                    : "glass border border-border/50"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-5 h-5 text-foreground" />
                </div>
                <div className="glass rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-border bg-background/50">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
                placeholder="Tanyakan sesuatu..."
                className="flex-1 glass border-0"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSend}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={isTyping}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatDemo;
