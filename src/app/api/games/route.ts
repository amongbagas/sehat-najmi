import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId, score, duration, completed } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    const newSession = await prisma.gameSession.create({
      data: {
        participantId: session.user.participantId,
        gameId,
        score: score || 0,
        duration: duration || 0,
        completed: completed || false,
      },
    });

    return NextResponse.json({ success: true, session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Error saving game session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
