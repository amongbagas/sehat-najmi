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

    const { missionId, status } = await req.json();

    if (!missionId || !status) {
      return NextResponse.json({ error: "Mission ID and status are required" }, { status: 400 });
    }

    const newProgress = await prisma.missionProgress.create({
      data: {
        participantId: session.user.participantId,
        missionId,
        status, // "COMPLETED"
      },
    });

    return NextResponse.json({ success: true, progress: newProgress }, { status: 201 });
  } catch (error) {
    console.error("Error saving mission progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
