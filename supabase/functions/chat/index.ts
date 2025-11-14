import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Autentikasi diperlukan untuk menggunakan chat AI." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client and verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Autentikasi tidak valid. Silakan login kembali." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Rate limiting based on authenticated user
    const userId = user.id;
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages, conversationId, category } = await req.json();
    
    console.log("Processing chat request:", { conversationId, category, messagesLength: messages?.length });
    
    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Format pesan tidak valid." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Jumlah pesan harus antara 1 dan 50." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Setiap pesan harus memiliki role dan content." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (!["user", "assistant", "system"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Role pesan tidak valid." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (typeof msg.content !== "string" || msg.content.length > 4000) {
        return new Response(
          JSON.stringify({ error: "Content pesan harus berupa string dengan maksimal 4000 karakter." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages.length, "messages");

    // System prompts for different categories
    const systemPrompts: Record<string, string> = {
      general: "Anda adalah VisentaAI, asisten AI yang membantu menjawab berbagai pertanyaan dengan ramah dan informatif dalam bahasa Indonesia.",
      math: "Anda adalah tutor matematika yang ahli di VisentaAI. Bantu menjelaskan konsep matematika dengan jelas, berikan langkah-langkah penyelesaian soal yang detail, dan pastikan siswa memahami konsepnya. Jawab dalam bahasa Indonesia.",
      language: "Anda adalah tutor bahasa yang berpengalaman di VisentaAI. Bantu siswa mempelajari bahasa, tata bahasa, kosakata, dan percakapan dengan metode yang mudah dipahami. Jawab dalam bahasa Indonesia.",
      science: "Anda adalah tutor sains yang kompeten di VisentaAI. Jelaskan konsep fisika, kimia, biologi, dan sains lainnya dengan cara yang menarik dan mudah dipahami. Jawab dalam bahasa Indonesia.",
      support: "Anda adalah customer support VisentaAI yang membantu pengguna melaporkan masalah, memberikan saran, dan menjawab pertanyaan tentang aplikasi dengan profesional dan ramah. Jawab dalam bahasa Indonesia."
    };

    const systemPrompt = systemPrompts[category] || systemPrompts.general;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: systemPrompt
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      // Log detailed errors server-side only
      console.error("[INTERNAL] AI gateway error:", { status: response.status });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Batas permintaan terlampaui, silakan coba lagi nanti." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Pembayaran diperlukan, silakan tambahkan dana ke workspace Lovable AI Anda." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Generic error message for all other cases
      return new Response(
        JSON.stringify({ error: "Layanan sementara tidak tersedia. Silakan coba lagi nanti." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    // Log detailed error server-side only
    console.error("[INTERNAL] Chat error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan. Silakan coba lagi nanti." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
