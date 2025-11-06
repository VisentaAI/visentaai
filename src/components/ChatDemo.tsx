import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya asisten AI VisentaAI. Saya siap membantu Anda belajar. Apa yang ingin Anda pelajari hari ini?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const demoResponses = [
    "Pertanyaan yang bagus! Mari saya jelaskan dengan cara yang mudah dipahami...",
    "Saya akan membantu Anda memahami konsep ini dengan contoh praktis...",
    "Berdasarkan gaya belajar Anda, saya merekomendasikan pendekatan berikut...",
    "Mari kita pecah topik ini menjadi bagian-bagian yang lebih kecil...",
    "Saya mendeteksi Anda lebih suka pembelajaran visual. Mari gunakan diagram..."
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      const aiMessage: Message = {
        role: "assistant",
        content: randomResponse
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
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
                className={`flex items-start space-x-3 ${
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
                <div className={`max-w-[75%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-secondary text-white"
                    : "glass"
                }`}>
                  <p className="leading-relaxed">{message.content}</p>
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
          </div>

          <div className="p-6 border-t border-border bg-background/50">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Tanyakan sesuatu..."
                className="flex-1 glass border-0"
              />
              <Button 
                onClick={handleSend}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
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
