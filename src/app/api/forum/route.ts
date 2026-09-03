import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch forum topics with post counts
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topics = await prisma.forumTopic.findMany({
    orderBy: { timestamp: "desc" },
    include: {
      author: { select: { id: true, name: true, role: true } },
      posts: {
        orderBy: { timestamp: "asc" },
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
      },
      _count: { select: { posts: true } },
    },
  });

  return NextResponse.json(topics);
}

// POST: Create a new topic or reply
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, topicId } = body;

  // If topicId is provided, it's a reply
  if (topicId) {
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.create({
      data: {
        topicId,
        authorId: session.user.id,
        content,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  }

  // Create a new topic with an initial post
  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const topic = await prisma.forumTopic.create({
    data: {
      title,
      authorId: session.user.id,
      posts: {
        create: {
          authorId: session.user.id,
          content,
        },
      },
    },
    include: {
      author: { select: { id: true, name: true, role: true } },
      posts: {
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  return NextResponse.json(topic, { status: 201 });
}
