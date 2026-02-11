import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type MessageAttachment = {
  url: string;
  type: "image" | "file";
  publicId: string;
};

/**
 * Create a new conversation between a user and a brand for a given order.
 */
export async function createConversation({
  userId,
  brandProfileId,
  orderId,
}: {
  userId: string;
  brandProfileId: string;
  orderId: string;
}) {
  try {
    const conversation = await prisma.conversation.upsert({
      where: {
        userId_brandProfileId_orderId: {
          userId,
          brandProfileId,
          orderId,
        },
      },
      update: {},
      create: {
        userId,
        brandProfileId,
        orderId,
      },
    });
    return conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

/**
 * Ensure conversations exist for all brands in an order and seed one welcome
 * message per conversation when empty. Safe to call multiple times.
 */
export async function ensureOrderConversations(params: {
  orderId: string;
  userId: string;
}) {
  const { orderId, userId } = params;
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: { brandProfileId: true },
  });

  const uniqueBrandProfileIds = [...new Set(orderItems.map((i) => i.brandProfileId))];

  for (const brandProfileId of uniqueBrandProfileIds) {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { id: brandProfileId },
      select: { userId: true },
    });
    if (!brandProfile) continue;

    const conversation = await createConversation({
      userId,
      brandProfileId,
      orderId,
    });

    const hasMessages = await prisma.message.findFirst({
      where: { conversationId: conversation.id },
      select: { id: true },
    });
    if (hasMessages) continue;

    const welcomeMessage =
      "Thank you for your order! We're excited to prepare your items and will keep you updated on the status. Feel free to reach out if you have any questions.";

    await createMessage({
      conversationId: conversation.id,
      senderId: brandProfile.userId,
      content: welcomeMessage,
      attachments: [],
    });
  }
}

/**
 * Send a message in a conversation.
 */
export async function createMessage({
  conversationId,
  senderId,
  content,
  attachments,
}: {
  conversationId: string;
  senderId: string;
  content?: string;
  attachments?: MessageAttachment[];
}) {
  try {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content ?? undefined,
        attachments: attachments
          ? (attachments as Prisma.InputJsonValue)
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update conversation lastMessage and lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: content || "[Attachment]",
        lastMessageAt: new Date(),
      },
    });

    return message;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

/**
 * Get all conversations for a user (as buyer) or as a brand owner.
 */
export async function getConversationsForUser({
  userId,
  skip = 0,
  take = 20,
}: {
  userId: string;
  skip?: number;
  take?: number;
}) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userId }, // conversations where user is the buyer
          {
            brandProfile: {
              userId, // conversations where user is the brand owner
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        brandProfile: {
          select: {
            id: true,
            brandName: true,
            logoUrl: true,
            userId: true,
          },
        },
        order: {
          select: {
            id: true,
            receipt: true,
            status: true,
            createdAt: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            isRead: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      skip,
      take,
    });

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

/**
 * Get a specific conversation with metadata.
 */
export async function getConversationDetail(conversationId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        brandProfile: {
          select: {
            id: true,
            brandName: true,
            logoUrl: true,
            userId: true,
          },
        },
        order: {
          select: {
            id: true,
            receipt: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });

    return conversation;
  } catch (error) {
    console.error("Error fetching conversation detail:", error);
    throw error;
  }
}

/**
 * Get messages for a conversation with pagination.
 */
export async function getMessagesForConversation({
  conversationId,
  skip = 0,
  take = 50,
}: {
  conversationId: string;
  skip?: number;
  take?: number;
}) {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take,
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

/**
 * Mark a message as read.
 */
export async function markMessageRead(messageId: string) {
  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return message;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

/**
 * Mark all unread messages in a conversation as read for a given user.
 */
export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  try {
    // Mark all messages not from this user as read
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId, // not sent by current user
        },
        isRead: false,
      },
      data: { isRead: true },
    });

    return result;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
}

/**
 * Get unread message count for conversations.
 */
export async function getUnreadMessageCount(userId: string) {
  try {
    const count = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { userId }, // buyer
            {
              brandProfile: {
                userId, // brand owner
              },
            },
          ],
        },
        senderId: {
          not: userId,
        },
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
}

/**
 * Delete a conversation (soft or hard - here we do hard delete).
 */
export async function deleteConversation(conversationId: string) {
  try {
    await prisma.conversation.delete({
      where: { id: conversationId },
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
}
