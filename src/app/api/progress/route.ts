import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const pid = student.participantId;

  // Fetch all data in parallel
  const [
    moods,
    journals,
    cbtSessions,
    gameSessions,
    missions,
    gratitudes,
    assessments,
  ] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { participantId: pid },
      orderBy: { timestamp: "asc" },
    }),
    prisma.journalEntry.count({ where: { participantId: pid } }),
    prisma.cbtSession.count({ where: { participantId: pid, completed: true } }),
    prisma.gameSession.count({ where: { participantId: pid, completed: true } }),
    prisma.missionProgress.count({ where: { participantId: pid, status: "COMPLETED" } }),
    prisma.gratitudeEntry.findMany({
      where: { participantId: pid },
      orderBy: { timestamp: "desc" },
    }),
    prisma.assessmentResult.findMany({
      where: { participantId: pid },
      orderBy: { timestamp: "asc" },
    }),
  ]);

  // Last 7 days of mood
  const now = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const moodChart = last7.map((day) => {
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const entry = moods.find(
      (m) => new Date(m.timestamp) >= day && new Date(m.timestamp) <= dayEnd
    );
    return {
      date: day.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      value: entry?.moodValue ?? null,
    };
  });

  // Calculate activity streak (consecutive days with any activity)
  const activityDates = new Set([
    ...moods.map((m) => new Date(m.timestamp).toDateString()),
    ...gratitudes.map((g) => new Date(g.timestamp).toDateString()),
  ]);

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (activityDates.has(d.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  // Average mood
  const avgMood =
    moods.length > 0
      ? (moods.reduce((sum, m) => sum + m.moodValue, 0) / moods.length).toFixed(1)
      : null;

  return NextResponse.json({
    moodChart,
    stats: {
      totalMoodEntries: moods.length,
      totalJournals: journals,
      totalCbt: cbtSessions,
      totalGames: gameSessions,
      totalMissions: missions,
      totalGratitudes: gratitudes.length,
      avgMood,
      streak,
    },
    assessments: {
      pre: assessments.find((a) => a.type === "PRE_TEST")?.score ?? null,
      post: assessments.find((a) => a.type === "POST_TEST")?.score ?? null,
    },
  });
}
