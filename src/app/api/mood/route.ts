import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moods = await prisma.moodEntry.findMany({
      where: {
        participantId: session.user.participantId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 14, // Last 14 entries
    });

    return NextResponse.json({ moods });
  } catch (error) {
    console.error("Error fetching moods:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { moodValue, note } = body;

    if (!moodValue || moodValue < 1 || moodValue > 5) {
      return NextResponse.json({ error: "Invalid mood value" }, { status: 400 });
    }

    const newMood = await prisma.moodEntry.create({
      data: {
        participantId: session.user.participantId,
        moodValue,
        note: note || "",
      },
    });

    return NextResponse.json({ success: true, mood: newMood }, { status: 201 });
  } catch (error) {
    console.error("Error saving mood:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
