import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type BootstrapUser = {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "COUNSELOR";
  nip?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} wajib diisi.`);
  }
  return value;
}

function validatePassword(password: string, variableName: string) {
  if (password.length < 12) {
    throw new Error(`${variableName} minimal 12 karakter.`);
  }
}

async function createUserIfMissing(input: BootstrapUser) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== input.role) {
      throw new Error(
        `Akun ${email} sudah ada dengan role ${existing.role}, bukan ${input.role}.`,
      );
    }

    console.log(`Lewati ${input.role.toLowerCase()}: ${email} sudah ada.`);
    return;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  await prisma.user.create({
    data: {
      email,
      name: input.name,
      password: passwordHash,
      role: input.role,
      ...(input.role === "COUNSELOR"
        ? {
            counselorProfile: {
              create: { nip: input.nip || null },
            },
          }
        : {}),
    },
  });

  console.log(`Berhasil membuat ${input.role.toLowerCase()}: ${email}.`);
}

async function createDemoStudent(password: string) {
  const email = (
    process.env.BOOTSTRAP_STUDENT_EMAIL?.trim() || "student@sehat.demo"
  ).toLowerCase();
  const nis = process.env.BOOTSTRAP_STUDENT_NIS?.trim() || "S001";
  const participantId =
    process.env.BOOTSTRAP_STUDENT_PARTICIPANT_ID?.trim() || "P001";
  const studentClass =
    process.env.BOOTSTRAP_STUDENT_CLASS?.trim() || "10-A";

  let student = await prisma.user.findUnique({
    where: { email },
    include: { studentProfile: true },
  });

  if (student && student.role !== "STUDENT") {
    throw new Error(
      `Akun ${email} sudah ada dengan role ${student.role}, bukan STUDENT.`,
    );
  }

  if (!student) {
    const passwordHash = await bcrypt.hash(password, 12);
    student = await prisma.user.create({
      data: {
        email,
        name: process.env.BOOTSTRAP_STUDENT_NAME?.trim() || "Andi (Student)",
        password: passwordHash,
        role: "STUDENT",
        studentProfile: {
          create: { nis, participantId, class: studentClass },
        },
      },
      include: { studentProfile: true },
    });
    console.log(`Berhasil membuat student: ${email}.`);
  } else {
    console.log(`Lewati student: ${email} sudah ada.`);
  }

  if (!student.studentProfile) {
    throw new Error(`Akun student ${email} tidak memiliki StudentProfile.`);
  }

  return student.studentProfile.participantId;
}

async function createDemoResearchData(participantId: string) {
  const moodTemplates = [
    { moodValue: 4, note: "Had a good day at school", daysAgo: 2 },
    { moodValue: 3, note: "A bit tired", daysAgo: 1 },
    { moodValue: 5, note: "Aced my math test!", daysAgo: 0 },
  ];

  for (const mood of moodTemplates) {
    const existing = await prisma.moodEntry.findFirst({
      where: {
        participantId,
        moodValue: mood.moodValue,
        note: mood.note,
      },
    });

    if (!existing) {
      await prisma.moodEntry.create({
        data: {
          participantId,
          moodValue: mood.moodValue,
          note: mood.note,
          timestamp: new Date(Date.now() - 86_400_000 * mood.daysAgo),
        },
      });
    }
  }

  const journalContent =
    "I am grateful for my friends who helped me study.";
  const existingJournal = await prisma.journalEntry.findFirst({
    where: { participantId, content: journalContent },
  });

  if (!existingJournal) {
    await prisma.journalEntry.create({
      data: {
        participantId,
        prompt: "What are you grateful for today?",
        content: journalContent,
      },
    });
  }

  console.log("Data mood dan jurnal demo siap.");
}

async function main() {
  if (process.env.ALLOW_PRODUCTION_BOOTSTRAP !== "true") {
    throw new Error(
      "Set ALLOW_PRODUCTION_BOOTSTRAP=true untuk mengonfirmasi bootstrap production.",
    );
  }

  const adminPassword = requiredEnv("BOOTSTRAP_ADMIN_PASSWORD");
  validatePassword(adminPassword, "BOOTSTRAP_ADMIN_PASSWORD");

  await createUserIfMissing({
    email: process.env.BOOTSTRAP_ADMIN_EMAIL?.trim() || "admin@sehat.demo",
    name: process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "Admin SEHAT",
    password: adminPassword,
    role: "ADMIN",
  });

  const counselorPassword =
    process.env.BOOTSTRAP_COUNSELOR_PASSWORD?.trim() || adminPassword;
  validatePassword(counselorPassword, "BOOTSTRAP_COUNSELOR_PASSWORD");
  await createUserIfMissing({
    email:
      process.env.BOOTSTRAP_COUNSELOR_EMAIL?.trim() ||
      "counselor@sehat.demo",
    name:
      process.env.BOOTSTRAP_COUNSELOR_NAME?.trim() || "Budi (Counselor)",
    password: counselorPassword,
    role: "COUNSELOR",
    nip: process.env.BOOTSTRAP_COUNSELOR_NIP?.trim() || "C001",
  });

  const studentPassword =
    process.env.BOOTSTRAP_STUDENT_PASSWORD?.trim() || adminPassword;
  validatePassword(studentPassword, "BOOTSTRAP_STUDENT_PASSWORD");
  const participantId = await createDemoStudent(studentPassword);
  await createDemoResearchData(participantId);
}

main()
  .catch((error: unknown) => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.error("Email atau NIP bootstrap sudah digunakan.");
    } else {
      console.error(error instanceof Error ? error.message : error);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
