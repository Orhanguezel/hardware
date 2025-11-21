// Email service configuration
export const emailConfig = {
  from: 'Hardware Review <noreply@hardware-review.com>',
  replyTo: 'support@hardware-review.com',
  templates: {
    welcome: {
      subject: 'Hardware Review\'a Hoş Geldiniz!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1>Hardware Review</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hoş Geldiniz!</h2>
            <p>Hardware Review ailesine katıldığınız için teşekkür ederiz. Artık:</p>
            <ul>
              <li>En güncel donanım incelemelerini okuyabilirsiniz</li>
              <li>Ürün karşılaştırmaları yapabilirsiniz</li>
              <li>Yorumlarınızı paylaşabilirsiniz</li>
              <li>Favori içeriklerinizi kaydedebilirsiniz</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://hardware-review.com/dashboard" 
                 style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Dashboard'a Git
              </a>
            </div>
          </div>
          <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>Bu e-postayı almak istemiyorsanız, hesap ayarlarınızdan e-posta bildirimlerini kapatabilirsiniz.</p>
          </div>
        </div>
      `
    },
    emailVerification: {
      subject: 'E-posta Adresinizi Doğrulayın',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1>Hardware Review</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>E-posta Doğrulama</h2>
            <p>Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{verificationUrl}}" 
                 style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                E-postamı Doğrula
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">
              Bu link 15 dakika geçerlidir. Eğer butona tıklayamıyorsanız, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:
            </p>
            <p style="font-size: 12px; color: #666; word-break: break-all;">
              {{verificationUrl}}
            </p>
          </div>
        </div>
      `
    },
    passwordReset: {
      subject: 'Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1>Hardware Review</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Şifre Sıfırlama</h2>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" 
                 style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Şifremi Sıfırla
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">
              Bu link 15 dakika geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </p>
          </div>
        </div>
      `
    },
    commentReply: {
      subject: 'Yorumunuza Yanıt Verildi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1>Hardware Review</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Yorumunuza Yanıt Verildi</h2>
            <p><strong>{{authorName}}</strong> kullanıcısı, "<strong>{{articleTitle}}</strong>" makalesindeki yorumunuza yanıt verdi:</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #1a1a1a; margin: 20px 0;">
              <p style="margin: 0;">{{replyContent}}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{articleUrl}}" 
                 style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Makaleyi Görüntüle
              </a>
            </div>
          </div>
        </div>
      `
    },
    newArticle: {
      subject: 'Yeni İnceleme: {{articleTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1>Hardware Review</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Yeni İnceleme Yayında!</h2>
            <img src="{{articleImage}}" alt="{{articleTitle}}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin: 20px 0;">
            <h3>{{articleTitle}}</h3>
            <p>{{articleExcerpt}}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
              <div>
                <strong>Puan:</strong> {{articleScore}}/10
              </div>
              <div>
                <strong>Okuma Süresi:</strong> {{readTime}} dk
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{articleUrl}}" 
                 style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                İncelemeyi Oku
              </a>
            </div>
          </div>
        </div>
      `
    }
  }
}

export interface EmailData {
  to: string
  template: keyof typeof emailConfig.templates
  data: Record<string, string>
}

export async function sendEmail({ to, template, data }: EmailData) {
  try {
    // In a real application, you would integrate with an email service like:
    // - Resend
    // - SendGrid
    // - Mailgun
    // - AWS SES
    
    const templateConfig = emailConfig.templates[template]
    let html = templateConfig.html
    
    // Replace placeholders with actual data
    Object.entries(data).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    
    // For development, just log the email
    console.log('Email would be sent:', {
      to,
      subject: templateConfig.subject,
      html: html.substring(0, 200) + '...'
    })
    
    // In production, this would be the actual email sending logic:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: emailConfig.from,
        to: [to],
        subject: templateConfig.subject,
        html,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    
    return await response.json()
    */
    
    return { success: true, messageId: 'mock-message-id' }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Email notification functions
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    template: 'welcome',
    data: { name }
  })
}

export async function sendEmailVerification(email: string, verificationUrl: string) {
  return sendEmail({
    to: email,
    template: 'emailVerification',
    data: { verificationUrl }
  })
}

export async function sendPasswordReset(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    template: 'passwordReset',
    data: { resetUrl }
  })
}

export async function sendCommentReplyNotification(
  email: string, 
  authorName: string, 
  articleTitle: string, 
  replyContent: string, 
  articleUrl: string
) {
  return sendEmail({
    to: email,
    template: 'commentReply',
    data: { authorName, articleTitle, replyContent, articleUrl }
  })
}

export async function sendNewArticleNotification(
  email: string,
  articleTitle: string,
  articleExcerpt: string,
  articleImage: string,
  articleScore: string,
  readTime: string,
  articleUrl: string
) {
  return sendEmail({
    to: email,
    template: 'newArticle',
    data: { articleTitle, articleExcerpt, articleImage, articleScore, readTime, articleUrl }
  })
}
