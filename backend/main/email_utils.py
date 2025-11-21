import secrets
import string
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta


def generate_verification_token():
    """Generate a secure random token for email verification"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))


def send_verification_email(user):
    """Send email verification link to user"""
    # Generate verification token
    token = generate_verification_token()
    user.email_verification_token = token
    user.email_verification_token_created = timezone.now()
    user.save()
    
    # Create verification URL
    verification_url = f"http://localhost:3001/verify-email?token={token}&email={user.email}"
    
    # Email subject and content
    subject = "Donanım Puanı - E-posta Adresinizi Doğrulayın"
    
    # HTML email template
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>E-posta Doğrulama</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #3b82f6;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{
                background-color: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;
            }}
            .button {{
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Donanım Puanı</h1>
            <p>E-posta Adresinizi Doğrulayın</p>
        </div>
        <div class="content">
            <h2>Merhaba {user.first_name or user.username}!</h2>
            <p>Donanım Puanı'na hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.</p>
            
            <div style="text-align: center;">
                <a href="{verification_url}" class="button">E-posta Adresimi Doğrula</a>
            </div>
            
            <p>Eğer buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
            <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">
                {verification_url}
            </p>
            
            <p><strong>Önemli:</strong> Bu link 24 saat geçerlidir. Eğer bu süre içinde doğrulama yapmazsanız, yeni bir doğrulama e-postası göndermeniz gerekebilir.</p>
        </div>
        <div class="footer">
            <p>Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
            <p>&copy; 2024 Donanım Puanı. Tüm hakları saklıdır.</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_message = f"""
    Merhaba {user.first_name or user.username}!
    
    Donanım Puanı'na hoş geldiniz! Hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın.
    
    Doğrulama linki: {verification_url}
    
    Bu link 24 saat geçerlidir.
    
    Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
    
    Donanım Puanı Ekibi
    """
    
    try:
        send_mail(
            subject=subject,
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email gönderim hatası: {e}")
        return False


def is_verification_token_valid(user, token):
    """Check if verification token is valid and not expired"""
    if not user.email_verification_token or user.email_verification_token != token:
        return False
    
    if not user.email_verification_token_created:
        return False
    
    # Token expires after 24 hours
    token_age = timezone.now() - user.email_verification_token_created
    if token_age > timedelta(hours=24):
        return False
    
    return True


def verify_user_email(user):
    """Mark user's email as verified"""
    user.email_verified = timezone.now()
    user.email_verification_token = None
    user.email_verification_token_created = None
    user.save()


def send_newsletter_email(subscribers, article):
    """Send newsletter email to subscribers about new article"""
    from .models_extra import NewsletterSubscription
    from .models import User
    
    # Get active subscribers who have email notifications enabled
    active_subscribers = NewsletterSubscription.objects.filter(is_active=True)
    
    if not active_subscribers.exists():
        print("No active newsletter subscribers found")
        return False
    
    # Filter subscribers who have email notifications enabled
    subscribers_with_notifications = []
    for subscriber in active_subscribers:
        try:
            # Check if subscriber has a user account and email notifications are enabled
            user = User.objects.get(email=subscriber.email)
            # Check both the direct field and the notification_settings JSON
            email_notifications_enabled = (
                user.email_notifications and 
                user.notification_settings.get('email_notifications', True)
            )
            if email_notifications_enabled:
                subscribers_with_notifications.append(subscriber)
                print(f"User {subscriber.email} has email notifications enabled")
            else:
                print(f"User {subscriber.email} has email notifications disabled - skipping")
        except User.DoesNotExist:
            # If no user account, don't send email (newsletter-only subscribers should not receive emails)
            print(f"No user account found for {subscriber.email} - skipping newsletter email")
    
    if not subscribers_with_notifications:
        print("No subscribers with email notifications enabled found")
        return False
    
    # Create article URL based on type
    url_mapping = {
        'REVIEW': f"http://localhost:3001/reviews/{article.slug}",
        'COMPARE': f"http://localhost:3001/compare-articles/{article.slug}",
        'BEST_LIST': f"http://localhost:3001/best/{article.slug}",
        'GUIDE': f"http://localhost:3001/guides/{article.slug}",
        'NEWS': f"http://localhost:3001/news/{article.slug}",
    }
    article_url = url_mapping.get(article.type, f"http://localhost:3001/articles/{article.slug}")
    
    # Email subject - Türkçe type mapping
    type_mapping = {
        'REVIEW': 'İnceleme',
        'BEST_LIST': 'En İyi Listesi',
        'COMPARE': 'Karşılaştırma',
        'GUIDE': 'Rehber',
        'NEWS': 'Haber'
    }
    article_type = type_mapping.get(article.type, 'İçerik')
    subject = f"Yeni {article_type}: {article.title}"
    
    # HTML email template
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Haftalık Bülten</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #3b82f6;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{
                background-color: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;
            }}
            .article-card {{
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .article-title {{
                color: #3b82f6;
                font-size: 24px;
                margin-bottom: 10px;
            }}
            .article-excerpt {{
                color: #666;
                margin-bottom: 15px;
            }}
            .button {{
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }}
            .unsubscribe {{
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Donanım Puanı</h1>
            <p>Haftalık Bülten</p>
        </div>
        <div class="content">
            <h2>En Güncel İncelemeleri Kaçırmayın!</h2>
            <p>Merhaba! Bu hafta sizin için özel olarak hazırladığımız yeni içeriği keşfedin.</p>
            
            <div class="article-card">
                <h3 class="article-title">{article.title}</h3>
                {f'<p class="article-excerpt">{article.excerpt}</p>' if article.excerpt else ''}
                <p><strong>Kategori:</strong> {article.category.name if article.category else 'Genel'}</p>
                <p><strong>Yazar:</strong> {article.author.first_name} {article.author.last_name}</p>
                
                <div style="text-align: center;">
                    <a href="{article_url}" class="button">{article_type}yi İncele</a>
                </div>
            </div>
            
            <p>Daha fazla içerik için web sitemizi ziyaret edin: <a href="http://localhost:3001">Donanım Puanı</a></p>
        </div>
        <div class="footer">
            <div class="unsubscribe">
                <p>Bu bülteni almak istemiyorsanız, <a href="http://localhost:3001/newsletter/unsubscribe?email=YOUR_EMAIL">buradan abonelikten çıkabilirsiniz</a>.</p>
            </div>
            <p>&copy; 2024 Donanım Puanı. Tüm hakları saklıdır.</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_message = f"""
    Donanım Puanı - Haftalık Bülten
    
    En Güncel İncelemeleri Kaçırmayın!
    
    Yeni İçerik: {article.title}
    {f'Açıklama: {article.excerpt}' if article.excerpt else ''}
    Kategori: {article.category.name if article.category else 'Genel'}
    Yazar: {article.author.first_name} {article.author.last_name}
    
    {article_type}yi incele: {article_url}
    
    Daha fazla içerik için: http://localhost:3001
    
    Bu bülteni almak istemiyorsanız, abonelikten çıkabilirsiniz.
    
    Donanım Puanı Ekibi
    """
    
    success_count = 0
    error_count = 0
    
    for subscriber in subscribers_with_notifications:
        try:
            # Replace YOUR_EMAIL placeholder with actual email
            personalized_html = html_message.replace('YOUR_EMAIL', subscriber.email)
            
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[subscriber.email],
                html_message=personalized_html,
                fail_silently=False,
            )
            success_count += 1
            print(f"Newsletter sent to {subscriber.email}")
        except Exception as e:
            error_count += 1
            print(f"Failed to send newsletter to {subscriber.email}: {e}")
    
    print(f"Newsletter sending completed: {success_count} successful, {error_count} failed")
    return success_count > 0


def generate_password_reset_code():
    """Generate a 6-digit password reset code"""
    import random
    return str(random.randint(100000, 999999))


def send_password_reset_email(user, code):
    """Send password reset code to user"""
    # Email subject
    subject = "Donanım Puanı - Şifre Sıfırlama Kodu"
    
    # HTML email template
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Şifre Sıfırlama</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #3b82f6;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{
                background-color: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;
            }}
            .code-container {{
                background-color: white;
                border: 2px solid #3b82f6;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                color: #3b82f6;
                letter-spacing: 4px;
                margin: 10px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }}
            .warning {{
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Donanım Puanı</h1>
            <p>Şifre Sıfırlama Kodu</p>
        </div>
        <div class="content">
            <h2>Merhaba {user.first_name or user.username}!</h2>
            <p>Şifrenizi sıfırlamak için aşağıdaki 6 haneli kodu kullanın:</p>
            
            <div class="code-container">
                <p style="margin: 0 0 10px 0; color: #666;">Şifre Sıfırlama Kodunuz:</p>
                <div class="code">{code}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Bu kod 15 dakika geçerlidir</p>
            </div>
            
            <div class="warning">
                <strong>Güvenlik Uyarısı:</strong> Bu kodu kimseyle paylaşmayın. Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
            </div>
            
            <p>Bu kodu kullanarak yeni şifrenizi belirleyebilirsiniz.</p>
        </div>
        <div class="footer">
            <p>Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
            <p>&copy; 2024 Donanım Puanı. Tüm hakları saklıdır.</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_message = f"""
    Merhaba {user.first_name or user.username}!
    
    Şifrenizi sıfırlamak için aşağıdaki 6 haneli kodu kullanın:
    
    Şifre Sıfırlama Kodunuz: {code}
    
    Bu kod 15 dakika geçerlidir.
    
    GÜVENLİK UYARISI: Bu kodu kimseyle paylaşmayın. Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
    
    Bu kodu kullanarak yeni şifrenizi belirleyebilirsiniz.
    
    Donanım Puanı Ekibi
    """
    
    try:
        send_mail(
            subject=subject,
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Password reset email gönderim hatası: {e}")
        return False