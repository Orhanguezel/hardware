import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Bu endpoint production'da Prisma Studio'yu proxy olarak çalıştırmak için kullanılabilir
  // Development'ta direkt localhost:5555'e yönlendiriyoruz
  
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.redirect('http://localhost:5555')
  }

  // Production için Prisma Studio'yu burada çalıştırabiliriz
  // Şimdilik development'a yönlendiriyoruz
  return NextResponse.json({
    message: 'Prisma Studio is only available in development mode',
    developmentUrl: 'http://localhost:5555'
  })
}
