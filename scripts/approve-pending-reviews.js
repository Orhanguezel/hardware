const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function approvePendingReviews() {
  try {
    // PENDING durumundaki yorumları bul
    const pendingReviews = await prisma.userReview.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        product: {
          select: {
            brand: true,
            model: true
          }
        }
      }
    })

    console.log(`Bulunan PENDING yorum sayısı: ${pendingReviews.length}`)

    if (pendingReviews.length === 0) {
      console.log('Onay bekleyen yorum bulunamadı.')
      return
    }

    // Yorumları listele
    console.log('\nOnay bekleyen yorumlar:')
    pendingReviews.forEach((review, index) => {
      console.log(`${index + 1}. ${review.user.name} - ${review.product.brand} ${review.product.model}`)
      console.log(`   Puan: ${review.rating}/5`)
      console.log(`   Başlık: ${review.title || 'Başlık yok'}`)
      console.log(`   Tarih: ${review.createdAt}`)
      console.log('')
    })

    // Tüm PENDING yorumları APPROVED yap
    const updateResult = await prisma.userReview.updateMany({
      where: {
        status: 'PENDING'
      },
      data: {
        status: 'APPROVED'
      }
    })

    console.log(`${updateResult.count} yorum APPROVED durumuna güncellendi.`)
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

approvePendingReviews()
