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

    const { type, score } = await req.json();

    if (!type || typeof score !== 'number') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const result = await prisma.assessmentResult.create({
      data: {
        participantId: session.user.participantId,
        type, // "PRE_TEST" or "POST_TEST"
        score,
      },
    });

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await prisma.assessmentResult.findMany({
      where: {
        participantId: session.user.participantId,
      },
      orderBy: { timestamp: "asc" }
    });

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
