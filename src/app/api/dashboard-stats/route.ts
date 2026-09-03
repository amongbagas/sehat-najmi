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

    // Only COUNSELOR, ADMIN, RESEARCHER can access this
    if (!["COUNSELOR", "ADMIN", "RESEARCHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Aggregate statistics
    const [
      totalStudents,
      moodEntries,
      journalEntries,
      aiConversations,
      assessmentResults,
      surveyResults,
      recentMoods,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.moodEntry.count(),
      prisma.journalEntry.count(),
      prisma.aiConversation.aggregate({ _sum: { messageCount: true } }),
      prisma.assessmentResult.findMany({ orderBy: { timestamp: "asc" } }),
      prisma.usabilitySurvey.aggregate({
        _avg: { usabilityScore: true, satisfaction: true, featureRating: true }
      }),
      prisma.moodEntry.findMany({
        orderBy: { timestamp: "desc" },
        take: 30,
        select: { moodValue: true, timestamp: true, participantId: true }
      }),
    ]);

    // Mood distribution
    const moodDistribution = [1, 2, 3, 4, 5].map(v => ({
      value: v,
      count: recentMoods.filter(m => m.moodValue === v).length
    }));

    // Assessment pre vs post averages
    const preTests = assessmentResults.filter(a => a.type === "PRE_TEST");
    const postTests = assessmentResults.filter(a => a.type === "POST_TEST");
    const avgPre = preTests.length > 0
      ? Math.round(preTests.reduce((s, a) => s + a.score, 0) / preTests.length)
      : 0;
    const avgPost = postTests.length > 0
      ? Math.round(postTests.reduce((s, a) => s + a.score, 0) / postTests.length)
      : 0;

    return NextResponse.json({
      stats: {
        totalStudents,
        totalMoodEntries: moodEntries,
        totalJournalEntries: journalEntries,
        totalAiMessages: aiConversations._sum.messageCount || 0,
      },
      moodDistribution,
      assessment: { avgPre, avgPost, preCount: preTests.length, postCount: postTests.length },
      survey: {
        avgUsability: Math.round((surveyResults._avg.usabilityScore || 0) * 10) / 10,
        avgSatisfaction: Math.round((surveyResults._avg.satisfaction || 0) * 10) / 10,
        avgFeatureRating: Math.round((surveyResults._avg.featureRating || 0) * 10) / 10,
      },
      recentMoods,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
