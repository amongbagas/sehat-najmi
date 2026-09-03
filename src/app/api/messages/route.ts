import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch conversations and messages
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");

  if (withUserId) {
    // Fetch messages between current user and specified user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: withUserId },
          { senderId: withUserId, receiverId: session.user.id },
        ],
      },
      orderBy: { timestamp: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: withUserId,
        receiverId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json(messages);
  }

  // Fetch conversation list (unique contacts)
  const sent = await prisma.message.findMany({
    where: { senderId: session.user.id },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });

  const received = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  // Collect unique user IDs
  const contactIds = new Set<string>();
  sent.forEach((m) => contactIds.add(m.receiverId));
  received.forEach((m) => contactIds.add(m.senderId));

  // Get contact details with last message and unread count
  const contacts = await Promise.all(
    Array.from(contactIds).map(async (contactId) => {
      const user = await prisma.user.findUnique({
        where: { id: contactId },
        select: { id: true, name: true, role: true, email: true },
      });

      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: contactId },
            { senderId: contactId, receiverId: session.user.id },
          ],
        },
        orderBy: { timestamp: "desc" },
      });

      const unreadCount = await prisma.message.count({
        where: {
          senderId: contactId,
          receiverId: session.user.id,
          read: false,
        },
      });

      return {
        user,
        lastMessage,
        unreadCount,
      };
    })
  );

  // Sort by latest message
  contacts.sort((a, b) => {
    const timeA = a.lastMessage?.timestamp?.getTime() || 0;
    const timeB = b.lastMessage?.timestamp?.getTime() || 0;
    return timeB - timeA;
  });

  return NextResponse.json(contacts);
}

// POST: Send a message
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { receiverId, content } = body;

  if (!receiverId || !content) {
    return NextResponse.json(
      { error: "Receiver and content are required" },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      content,
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
