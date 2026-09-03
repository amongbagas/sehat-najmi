import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ participantId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["COUNSELOR", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { participantId } = await params;

    const student = await prisma.studentProfile.findUnique({
      where: { participantId },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch mood history
    const moodHistory = await prisma.moodEntry.findMany({
      where: { participantId },
      orderBy: { timestamp: 'desc' },
      take: 30
    });

    // Fetch assessment results
    const assessments = await prisma.assessmentResult.findMany({
      where: { participantId },
      orderBy: { timestamp: 'asc' }
    });

    // Fetch mission progress
    const missions = await prisma.missionProgress.findMany({
      where: { participantId, status: "COMPLETED" },
      orderBy: { timestamp: 'desc' }
    });
    
    // CBT sessions
    const cbtSessions = await prisma.cbtSession.findMany({
      where: { participantId, completed: true },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({
      profile: {
        name: student.user.name || "Unknown",
        nis: student.nis,
        className: student.class,
        participantId: student.participantId,
        joinedAt: student.createdAt
      },
      moodHistory,
      assessments,
      completedMissions: missions,
      completedCbt: cbtSessions
    });
  } catch (error) {
    console.error("Fetch student detail error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
