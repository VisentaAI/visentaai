import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const generateWelcomeEmailHTML = (
  confirmUrl: string,
  token: string,
  userName: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Datang di VisentaAI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); max-width: 600px;">
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a1a; line-height: 1.3;">
                🎉 Selamat Datang di VisentaAI!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 16px 0; font-size: 16px; line-height: 26px; color: #333;">
                Halo <strong>${userName}</strong>,
              </p>
              <p style="margin: 16px 0; font-size: 16px; line-height: 26px; color: #333;">
                Terima kasih telah mendaftar di VisentaAI! Kami sangat senang Anda bergabung dengan komunitas kami untuk belajar dan berkembang bersama AI.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <a href="${confirmUrl}" 
                 style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 14px 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);">
                Konfirmasi Email Saya
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 16px 0; font-size: 16px; line-height: 26px; color: #333;">
                Atau, salin dan tempel kode konfirmasi berikut:
              </p>
              <div style="background-color: #f4f4f7; border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px 24px; margin: 16px 0; text-align: center;">
                <code style="font-size: 18px; font-weight: bold; color: #333; letter-spacing: 2px;">${token}</code>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 0;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 12px 0; font-size: 14px; line-height: 22px; color: #555;">
                Dengan mengonfirmasi email Anda, Anda akan mendapatkan akses penuh ke:
              </p>
              <p style="margin: 12px 0; font-size: 14px; line-height: 22px; color: #555;">
                ✨ Chat AI untuk pembelajaran interaktif<br>
                📚 Materi pembelajaran lengkap<br>
                👥 Komunitas pembelajar yang aktif<br>
                🎯 Tracking progress belajar Anda
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 0;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 12px 0; font-size: 14px; line-height: 22px; color: #555;">
                Jika Anda tidak mendaftar di VisentaAI, Anda dapat mengabaikan email ini dengan aman.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px 40px 40px;">
              <p style="margin: 0; font-size: 12px; line-height: 16px; color: #8898aa;">
                <strong>VisentaAI</strong><br>
                Platform pembelajaran AI interaktif<br>
                <a href="mailto:hello@visentaai.com" style="color: #6366f1; text-decoration: underline;">hello@visentaai.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

serve(async (req) => {
  console.log('Received webhook request')
  
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method)
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Verifying webhook signature...')
    const wh = new Webhook(hookSecret)
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
        user_metadata?: {
          full_name?: string
        }
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
      }
    }

    console.log('Webhook verified, preparing email for:', user.email)
    
    const userName = user.user_metadata?.full_name || user.email.split('@')[0]
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

    console.log('Generating email HTML...')
    const html = generateWelcomeEmailHTML(confirmUrl, token, userName)

    console.log('Sending email via Resend...')
    const { data, error } = await resend.emails.send({
      from: 'VisentaAI <onboarding@resend.dev>',
      to: [user.email],
      subject: '🎉 Selamat Datang di VisentaAI - Konfirmasi Akun Anda',
      html,
    })
    
    if (error) {
      console.error('Resend error:', error)
      throw error
    }
    
    console.log('Email sent successfully:', data)
    
    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'INTERNAL_ERROR',
        },
      }),
      {
        status: error.code === 401 ? 401 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
