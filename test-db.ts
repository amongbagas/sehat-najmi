import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";

async function test() {
  const user = await prisma.user.findUnique({
    where: { email: "student@sehat.demo" },
    include: { studentProfile: true }
  });

  if (!user) {
    console.log("❌ USER NOT FOUND IN DATABASE!");
    return;
  }

  console.log("✅ User found:", user.email);
  console.log("   Role:", user.role);
  console.log("   Has studentProfile:", !!user.studentProfile);
  console.log("   ParticipantId:", user.studentProfile?.participantId);
  
  const match = await bcrypt.compare("password123", user.password);
  console.log("   Password match:", match ? "✅ YES" : "❌ NO");
}

test().catch(console.error).finally(() => prisma.$disconnect());
