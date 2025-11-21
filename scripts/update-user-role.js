const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateUserRole() {
  try {
    // Tüm kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('Mevcut kullanıcılar:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
    })

    if (users.length === 0) {
      console.log('Hiç kullanıcı bulunamadı.')
      return
    }

    // İlk kullanıcıyı EDITOR yap
    const firstUser = users[0]
    const updatedUser = await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'EDITOR' }
    })

    console.log(`\n${updatedUser.name} kullanıcısı EDITOR rolüne yükseltildi.`)
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRole()
