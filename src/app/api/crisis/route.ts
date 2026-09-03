import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch all crisis alerts (for counselors)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["COUNSELOR", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.crisisAlert.findMany({
    orderBy: { timestamp: "desc" },
    include: {
      student: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  return NextResponse.json(alerts);
}

// POST: Create a crisis alert (for students)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.participantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const alert = await prisma.crisisAlert.create({
    data: {
      participantId: session.user.participantId,
      notes: body.notes || null,
      status: "PENDING",
    },
  });

  return NextResponse.json(alert, { status: 201 });
}

// PATCH: Update crisis alert status (for counselors)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["COUNSELOR", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, notes } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "ID and status required" }, { status: 400 });
  }

  const updated = await prisma.crisisAlert.update({
    where: { id },
    data: {
      status,
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json(updated);
}
