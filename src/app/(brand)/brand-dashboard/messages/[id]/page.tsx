"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content?: string;
  attachments: Array<{ url: string; type: "image" | "file"; publicId: string }>;
  isRead: boolean;
  createdAt: string;
};

type ConversationDetail = {
  id: string;
  user: { id: string; name: string; username: string; avatarUrl?: string };
  brandProfile: { brandName: string; logoUrl?: string };
  order: { receipt?: string; status: string };
};

export default function BrandMessageThreadPage() {
  const params = useParams();
  const { data: session } = useSession();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachedImages, setAttachedImages] = useState<
    Array<{ url: string; type: "image"; publicId: string }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch conversation and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [convRes, msgRes] = await Promise.all([
          fetch(`/api/conversations/${conversationId}`),
          fetch(`/api/conversations/${conversationId}/messages?take=100`),
        ]);

        if (!convRes.ok || !msgRes.ok) throw new Error("Failed to fetch");

        const convData = await convRes.json();
        const msgData = await msgRes.json();

        setConversation(convData);
        setMessages(msgData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("uploadType", "message");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "Upload failed");
        const uploadedUrl = data.url ?? data.secure_url;
        if (!uploadedUrl) throw new Error("Upload response missing URL");

        setAttachedImages((prev) => [
          ...prev,
          {
            url: uploadedUrl,
            type: "image",
            publicId: data.public_id ?? "",
          },
        ]);
      } catch (err) {
        console.error("Error uploading image:", err);
        setError("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText && attachedImages.length === 0) return;

    try {
      setSending(true);
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageText || undefined,
          attachments: attachedImages,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const newMessage = await res.json();

      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
      setAttachedImages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-gray-500">Conversation not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <Header
        userName={conversation.user.name || conversation.user.username}
        userAvatar={conversation.user.avatarUrl}
        orderId={conversation.order.receipt || conversation.id}
        status={conversation.order.status}
      />

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              isFromUser={msg.senderId === conversation.user.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        value={messageText}
        onChange={setMessageText}
        onSubmit={handleSendMessage}
        onImageUpload={handleImageUpload}
        sending={sending}
        uploading={uploading}
        attachedImages={attachedImages}
        onRemoveImage={(idx) =>
          setAttachedImages((prev) => prev.filter((_, i) => i !== idx))
        }
        fileInputRef={fileInputRef}
      />
    </div>
  );
}

// ============== Components ==============

function Header({
  userName,
  userAvatar,
  orderId,
  status,
}: {
  userName: string;
  userAvatar?: string;
  orderId: string;
  status: string;
}) {
  const statusColors: Record<string, string> = {
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-700",
    PROCESSING: "bg-orange-100 text-orange-700",
    CREATED: "bg-gray-100 text-gray-700",
    PAID: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-pink-100 text-pink-700",
  };

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-white">
      {userAvatar ? (
        <img
          src={userAvatar}
          alt={userName}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-300" />
      )}
      <div className="flex-1">
        <p className="text-sm font-semibold">{userName}</p>
        <p className="text-xs text-gray-500">Order #{orderId}</p>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${
          statusColors[status] || "bg-gray-200 text-gray-700"
        }`}
      >
        {status}
      </span>
    </header>
  );
}

function MessageCard({
  message,
  isFromUser,
}: {
  message: Message;
  isFromUser: boolean;
}) {
  return (
    <div className={`flex ${isFromUser ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] ${
          isFromUser
            ? "bg-gray-100 text-gray-800 rounded-3xl rounded-tl-lg"
            : "bg-[#1f2f1f] text-white rounded-3xl rounded-tr-lg"
        } px-4 py-3`}
      >
        {isFromUser && (
          <p className="text-xs font-semibold text-gray-600 mb-1">
            {message.senderName}
          </p>
        )}
        {message.content && (
          <p className="text-sm wrap-break-word">{message.content}</p>
        )}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {message.attachments.map((att, idx) => (
              <img
                key={idx}
                src={att.url}
                alt="attachment"
                className="rounded-lg max-h-40 object-cover"
              />
            ))}
          </div>
        )}
        <p
          className={`text-[11px] ${isFromUser ? "text-gray-600" : "text-gray-300"} mt-1`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

function MessageInput({
  value,
  onChange,
  onSubmit,
  onImageUpload,
  sending,
  uploading,
  attachedImages,
  onRemoveImage,
  fileInputRef,
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sending: boolean;
  uploading: boolean;
  attachedImages: Array<{ url: string; type: "image"; publicId: string }>;
  onRemoveImage: (idx: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="border-t bg-white fixed bottom-0 left-0 right-0 px-4 py-3 space-y-3"
    >
      {attachedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {attachedImages.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img.url}
                alt="preview"
                className="w-full h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message..."
          disabled={sending || uploading}
          className="flex-1 rounded-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-50"
        >
          {uploading ? "⏳" : "📷"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />

        <button
          type="submit"
          disabled={
            sending || (!value && attachedImages.length === 0) || uploading
          }
          className="shrink-0 h-10 w-10 rounded-full bg-[#1f2f1f] text-white flex items-center justify-center hover:bg-[#2a3a2a] disabled:opacity-50"
        >
          {sending ? "⏳" : "→"}
        </button>
      </div>
    </form>
  );
}
