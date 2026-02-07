import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getConversationsForUser, createConversation } from "@/lib/messages";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/conversations
 * Fetch all conversations for the current user (as buyer or brand owner).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");

    const conversations = await getConversationsForUser({
      userId: session.user.id,
      skip,
      take,
    });

    // Format response for frontend
    const formatted = conversations.map((conv) => ({
      id: conv.id,
      userId: conv.user.id,
      userName: conv.user.name || conv.user.username,
      userAvatar: conv.user.avatarUrl,
      brandProfileId: conv.brandProfile.id,
      brandName: conv.brandProfile.brandName,
      brandLogo: conv.brandProfile.logoUrl,
      orderId: conv.order.id,
      orderReceipt: conv.order.receipt,
      orderStatus: conv.order.status,
      lastMessageText: conv.lastMessageText,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.messages.some(
        (m) => !m.isRead && m.senderId !== session.user.id,
      )
        ? 1
        : 0,
      createdAt: conv.createdAt,
    }));

    return NextResponse.json({
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation between a user and a brand (triggered by order placement or manual).
 * Body: { userId, brandProfileId, orderId }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, brandProfileId, orderId } = body;

    if (!userId || !brandProfileId || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, brandProfileId, orderId" },
        { status: 400 },
      );
    }

    // Verify user is the buyer or authorized to create this conversation
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: can only create conversations for self" },
        { status: 403 },
      );
    }

    // Verify the order belongs to the user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json(
        { error: "Order not found or does not belong to user" },
        { status: 404 },
      );
    }

    // Verify the brand profile exists
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { id: brandProfileId },
    });

    if (!brandProfile) {
      return NextResponse.json(
        { error: "Brand profile not found" },
        { status: 404 },
      );
    }

    const conversation = await createConversation({
      userId,
      brandProfileId,
      orderId,
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
