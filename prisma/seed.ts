import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed is disabled in production')
  }

  console.log('Seeding demo data...')

  // Clear existing data
  await prisma.aiConversation.deleteMany()
  await prisma.journalEntry.deleteMany()
  await prisma.moodEntry.deleteMany()
  await prisma.cbtSession.deleteMany()
  await prisma.gameSession.deleteMany()
  await prisma.missionProgress.deleteMany()
  await prisma.gratitudeEntry.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.counselorProfile.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sehat.demo',
      name: 'Admin SEHAT',
      password: passwordHash,
      role: 'ADMIN',
    },
  })
  console.log(`Created admin: ${admin.email}`)

  // 2. Create Counselor
  const counselorUser = await prisma.user.create({
    data: {
      email: 'counselor@sehat.demo',
      name: 'Budi (Counselor)',
      password: passwordHash,
      role: 'COUNSELOR',
      counselorProfile: {
        create: {
          nip: 'C001',
        },
      },
    },
  })
  console.log(`Created counselor: ${counselorUser.email}`)

  // 3. Create Student
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@sehat.demo',
      name: 'Andi (Student)',
      password: passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          nis: 'S001',
          participantId: 'P001',
          class: '10-A',
        },
      },
    },
    include: {
      studentProfile: true,
    }
  })
  console.log(`Created student: ${studentUser.email}`)

  const participantId = studentUser.studentProfile!.participantId

  // 4. Create Sample Data for Student
  await prisma.moodEntry.createMany({
    data: [
      { participantId, moodValue: 4, note: 'Had a good day at school', timestamp: new Date(Date.now() - 86400000 * 2) },
      { participantId, moodValue: 3, note: 'A bit tired', timestamp: new Date(Date.now() - 86400000 * 1) },
      { participantId, moodValue: 5, note: 'Aced my math test!', timestamp: new Date() },
    ]
  })

  await prisma.journalEntry.create({
    data: {
      participantId,
      prompt: 'What are you grateful for today?',
      content: 'I am grateful for my friends who helped me study.',
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
