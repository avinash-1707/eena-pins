import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import {
  getMessagesForConversation,
  createMessage,
  markMessageRead,
} from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/conversations/[id]/messages
 * Fetch messages for a conversation with pagination.
 * Query params: skip (default 0), take (default 50)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "50");

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const isBuyer = conversation.userId === session.user.id;
    const isBrandOwner =
      (
        await prisma.brandProfile.findUnique({
          where: { id: conversation.brandProfileId },
        })
      )?.userId === session.user.id;

    if (!isBuyer && !isBrandOwner) {
      return NextResponse.json(
        { error: "Unauthorized: no access to this conversation" },
        { status: 403 },
      );
    }

    const messages = await getMessagesForConversation({
      conversationId: id,
      skip,
      take,
    });

    // Mark fetched messages as read if they're not from the current user
    const unreadMessages = messages.filter(
      (m) => !m.isRead && m.senderId !== session.user.id,
    );

    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map((m) => markMessageRead(m.id)));
    }

    // Format messages for response
    const formatted = messages.map((msg) => {
      let attachments: any[] = [];
      try {
        if (!msg.attachments) attachments = [];
        else if (Array.isArray(msg.attachments)) attachments = msg.attachments;
        else attachments = JSON.parse(msg.attachments as any);
      } catch (e) {
        attachments = [];
      }

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.sender.name || msg.sender.username,
        senderAvatar: msg.sender.avatarUrl,
        content: msg.content,
        attachments,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
      };
    });

    return NextResponse.json({
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a new message in a conversation.
 * Body: { content?, attachments?: Array<{url, type, publicId}> }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, attachments: incomingAttachments } = body as {
      content?: string;
      attachments?: any[];
    };

    if (
      !content &&
      (!incomingAttachments || incomingAttachments.length === 0)
    ) {
      return NextResponse.json(
        { error: "Message must contain text or attachments" },
        { status: 400 },
      );
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const isBuyer = conversation.userId === session.user.id;
    const isBrandOwner =
      (
        await prisma.brandProfile.findUnique({
          where: { id: conversation.brandProfileId },
        })
      )?.userId === session.user.id;

    if (!isBuyer && !isBrandOwner) {
      return NextResponse.json(
        { error: "Unauthorized: no access to this conversation" },
        { status: 403 },
      );
    }

    const message = await createMessage({
      conversationId: id,
      senderId: session.user.id,
      content,
      attachments: incomingAttachments || [],
    });

    // Format response
    let parsedAttachments: any[] = [];
    try {
      if (!message.attachments) parsedAttachments = [];
      else if (Array.isArray(message.attachments))
        parsedAttachments = message.attachments;
      else parsedAttachments = JSON.parse(message.attachments as any);
    } catch (e) {
      parsedAttachments = [];
    }

    const sender = (message as any).sender || null;

    const formatted = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: sender ? sender.name || sender.username : null,
      senderAvatar: sender ? sender.avatarUrl : null,
      content: message.content,
      attachments: parsedAttachments,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations/[id]/messages error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
