import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FALLBACK_RESPONSES = [
  "I hear you. Remember that it's okay to feel this way. How can I support you further?",
  "Thank you for sharing that with me. Have you tried taking a few deep breaths?",
  "That sounds challenging. If you ever feel overwhelmed, reaching out to your school counselor might be a good step.",
  "You're doing great just by reflecting on this. Want to try a quick gratitude exercise?",
  "I understand. Take things one step at a time.",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => null);
    const message =
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 2_000) {
      return NextResponse.json(
        { error: "Message must be 2,000 characters or fewer" },
        { status: 400 }
      );
    }

    const participantId = session.user.participantId;

    // Research usage is tied to StudentProfile. Staff accounts may use the AI,
    // but must not be assigned a fake participant identity or included in data.
    if (participantId) {
      const conversation = await prisma.aiConversation.findFirst({
        where: { participantId },
      });

      if (conversation) {
        await prisma.aiConversation.update({
          where: { id: conversation.id },
          data: { messageCount: { increment: 1 } },
        });
      } else {
        await prisma.aiConversation.create({
          data: {
            participantId,
            messageCount: 1,
          },
        });
      }
    }

    // Determine Provider
    const provider = process.env.AI_PROVIDER || "demo";
    
    // Safety check simulation
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("kill") || lowerMsg.includes("die") || lowerMsg.includes("suicide") || lowerMsg.includes("self harm")) {
      return NextResponse.json({ 
        reply: "I am an AI and I cannot provide medical help. It sounds like you are going through a very difficult time. Please reach out to your school counselor immediately, or contact emergency services.",
        isEmergency: true
      });
    }

    if (provider === "demo") {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const randomReply = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return NextResponse.json({ reply: randomReply });
    } else {
      // Production mode (to be implemented with actual API key)
      return NextResponse.json({ reply: "Production AI is not yet configured. Please set AI_PROVIDER=demo." });
    }
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
