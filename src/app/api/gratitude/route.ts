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

    const entries = await prisma.gratitudeEntry.findMany({
      where: {
        participantId: session.user.participantId,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching gratitude:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newEntry = await prisma.gratitudeEntry.create({
      data: {
        participantId: session.user.participantId,
        content,
      },
    });

    return NextResponse.json({ success: true, entry: newEntry }, { status: 201 });
  } catch (error) {
    console.error("Error saving gratitude:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
