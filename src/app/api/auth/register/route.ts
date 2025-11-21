import { NextRequest, NextResponse } from 'next/server'
import { DJANGO_API_URL } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Create a valid username by removing spaces and special characters
    const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.random().toString(36).substr(2, 4)
    
    const response = await fetch(`${DJANGO_API_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        password_confirm: password,
        first_name: name,
        last_name: '',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Backend'den gelen hata mesajlarını işle
      let errorMessage = 'Kayıt sırasında bir hata oluştu'
      
      if (errorData.details && errorData.details.length > 0) {
        // İlk hata mesajını kullan
        errorMessage = errorData.details[0]
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.field_errors) {
        // Field hatalarını işle
        const fieldErrors = Object.values(errorData.field_errors).flat()
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors[0] as string
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      message: data.message || 'Hesap başarıyla oluşturuldu! E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.',
      email_sent: data.email_sent,
      data: {
        id: data.user.id,
        name: data.user.first_name || data.user.username,
        email: data.user.email,
        role: data.user.role
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
