import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["COUNSELOR", "ADMIN", "RESEARCHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "mood";

    let csvContent = "";

    if (type === "mood") {
      const moods = await prisma.moodEntry.findMany({
        orderBy: { timestamp: "asc" },
        select: {
          participantId: true,
          moodValue: true,
          note: true,
          timestamp: true,
        }
      });
      csvContent = "participantId,moodValue,note,timestamp\n";
      csvContent += moods.map(m =>
        `"${m.participantId}","${m.moodValue}","${(m.note || "").replace(/"/g, '""')}","${m.timestamp.toISOString()}"`
      ).join("\n");

    } else if (type === "assessment") {
      const results = await prisma.assessmentResult.findMany({
        orderBy: { timestamp: "asc" },
        select: {
          participantId: true,
          type: true,
          score: true,
          timestamp: true,
        }
      });
      csvContent = "participantId,type,score,timestamp\n";
      csvContent += results.map(r =>
        `"${r.participantId}","${r.type}","${r.score}","${r.timestamp.toISOString()}"`
      ).join("\n");

    } else if (type === "survey") {
      const surveys = await prisma.usabilitySurvey.findMany({
        orderBy: { timestamp: "asc" },
        select: {
          participantId: true,
          usabilityScore: true,
          satisfaction: true,
          featureRating: true,
          feedback: true,
          timestamp: true,
        }
      });
      csvContent = "participantId,usabilityScore,satisfaction,featureRating,feedback,timestamp\n";
      csvContent += surveys.map(s =>
        `"${s.participantId}","${s.usabilityScore}","${s.satisfaction}","${s.featureRating}","${(s.feedback || "").replace(/"/g, '""')}","${s.timestamp.toISOString()}"`
      ).join("\n");

    } else if (type === "engagement") {
      // Aggregated engagement per participant
      const participants = await prisma.studentProfile.findMany({
        select: {
          participantId: true,
          class: true,
          _count: {
            select: {
              moodEntries: true,
              journalEntries: true,
              gratitudeEntries: true,
              cbtSessions: true,
              gameSessions: true,
              missionProgress: true,
            }
          }
        }
      });
      csvContent = "participantId,class,moodEntries,journalEntries,gratitudeEntries,cbtSessions,gameSessions,missionsCompleted\n";
      csvContent += participants.map(p =>
        `"${p.participantId}","${p.class}","${p._count.moodEntries}","${p._count.journalEntries}","${p._count.gratitudeEntries}","${p._count.cbtSessions}","${p._count.gameSessions}","${p._count.missionProgress}"`
      ).join("\n");
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sehat_${type}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
