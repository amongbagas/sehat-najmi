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

    const { usabilityScore, satisfaction, featureRating, feedback } = await req.json();

    const survey = await prisma.usabilitySurvey.create({
      data: {
        participantId: session.user.participantId,
        usabilityScore,
        satisfaction,
        featureRating,
        feedback: feedback || null,
      },
    });

    return NextResponse.json({ success: true, survey }, { status: 201 });
  } catch (error) {
    console.error("Error saving survey:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
