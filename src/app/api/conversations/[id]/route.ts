import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import {
  getConversationDetail,
  deleteConversation,
  markConversationRead,
} from "@/lib/messages";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/conversations/[id]
 * Fetch a specific conversation's metadata.
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
    const conversation = await getConversationDetail(id);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Verify user has access to this conversation
    const isBuyer = conversation.userId === session.user.id;
    const isBrandOwner = conversation.brandProfile.userId === session.user.id;

    if (!isBuyer && !isBrandOwner) {
      return NextResponse.json(
        { error: "Unauthorized: no access to this conversation" },
        { status: 403 },
      );
    }

    // Mark conversation as read for this user
    await markConversationRead(id, session.user.id);

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("GET /api/conversations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * Delete a conversation (closes it for both parties).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const conversation = await getConversationDetail(id);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Verify user has access to this conversation
    const isBuyer = conversation.userId === session.user.id;
    const isBrandOwner = conversation.brandProfile.userId === session.user.id;

    if (!isBuyer && !isBrandOwner) {
      return NextResponse.json(
        { error: "Unauthorized: no access to this conversation" },
        { status: 403 },
      );
    }

    await deleteConversation(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conversations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}
