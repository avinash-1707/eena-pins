# Messaging API Reference

## Base URL

```
http://localhost:3000/api
```

---

## Conversations Endpoints

### **GET /conversations**

List all conversations for the current user (as buyer or brand owner).

**Query Parameters:**

- `skip` (optional, default: 0) - Pagination offset
- `take` (optional, default: 20) - Page size

**Response:**

```json
{
  "data": [
    {
      "id": "conv-123",
      "userId": "user-456",
      "userName": "John Doe",
      "userAvatar": "https://...",
      "brandProfileId": "brand-789",
      "brandName": "Nordic Living",
      "brandLogo": "https://...",
      "orderId": "order-101",
      "orderReceipt": "ORD-2025-001",
      "orderStatus": "DELIVERED",
      "lastMessageText": "Thank you for your order!",
      "lastMessageAt": "2025-02-05T10:30:00Z",
      "unreadCount": 0,
      "createdAt": "2025-02-05T09:00:00Z"
    }
  ],
  "count": 1
}
```

**Errors:**

- `401 Unauthorized` - Not logged in
- `500 Server Error` - Database error

---

### **POST /conversations**

Create a new conversation (for buyer, initiated by system on order placement).

**Request Body:**

```json
{
  "userId": "user-456",
  "brandProfileId": "brand-789",
  "orderId": "order-101"
}
```

**Response:**

```json
{
  "id": "conv-123",
  "userId": "user-456",
  "brandProfileId": "brand-789",
  "orderId": "order-101",
  "lastMessageText": null,
  "lastMessageAt": null,
  "createdAt": "2025-02-05T10:00:00Z",
  "updatedAt": "2025-02-05T10:00:00Z"
}
```

**Errors:**

- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - Can only create for self
- `404 Not Found` - Order or brand not found

---

### **GET /conversations/{id}**

Get conversation details with metadata.

**Response:**

```json
{
  "id": "conv-123",
  "userId": "user-456",
  "brandProfileId": "brand-789",
  "orderId": "order-101",
  "lastMessageText": "Thank you for your order!",
  "lastMessageAt": "2025-02-05T10:30:00Z",
  "createdAt": "2025-02-05T09:00:00Z",
  "updatedAt": "2025-02-05T10:30:00Z",
  "user": {
    "id": "user-456",
    "name": "John Doe",
    "username": "johndoe",
    "avatarUrl": "https://..."
  },
  "brandProfile": {
    "id": "brand-789",
    "brandName": "Nordic Living",
    "logoUrl": "https://..."
  },
  "order": {
    "id": "order-101",
    "receipt": "ORD-2025-001",
    "status": "DELIVERED",
    "totalAmount": 5000,
    "createdAt": "2025-02-05T09:00:00Z"
  }
}
```

**Errors:**

- `401 Unauthorized` - Not logged in
- `403 Forbidden` - No access to this conversation
- `404 Not Found` - Conversation not found

---

### **DELETE /conversations/{id}**

Delete a conversation (archive/close).

**Response:**

```json
{
  "success": true
}
```

**Errors:**

- `401 Unauthorized` - Not logged in
- `403 Forbidden` - No access to this conversation
- `404 Not Found` - Conversation not found

---

## Messages Endpoints

### **GET /conversations/{id}/messages**

Get messages in a conversation with pagination.

**Query Parameters:**

- `skip` (optional, default: 0) - Pagination offset
- `take` (optional, default: 50) - Page size

**Response:**

```json
{
  "data": [
    {
      "id": "msg-001",
      "conversationId": "conv-123",
      "senderId": "user-456",
      "senderName": "John Doe",
      "senderAvatar": "https://...",
      "content": "Thank you for the quick delivery!",
      "attachments": [],
      "isRead": true,
      "createdAt": "2025-02-05T10:30:00Z"
    },
    {
      "id": "msg-002",
      "conversationId": "conv-123",
      "senderId": "brand-user-789",
      "senderName": "Nordic Living",
      "senderAvatar": "https://...",
      "content": null,
      "attachments": [
        {
          "url": "https://cloudinary.com/...",
          "type": "image",
          "publicId": "eena-pins/messages/abc123"
        }
      ],
      "isRead": true,
      "createdAt": "2025-02-05T10:35:00Z"
    }
  ],
  "count": 2
}
```

**Errors:**

- `401 Unauthorized` - Not logged in
- `403 Forbidden` - No access to this conversation
- `404 Not Found` - Conversation not found

---

### **POST /conversations/{id}/messages**

Send a new message with optional image attachments.

**Request Body (Text Only):**

```json
{
  "content": "Hello! I received my order.",
  "attachments": []
}
```

**Request Body (With Images):**

```json
{
  "content": "Here's a photo of the product",
  "attachments": [
    {
      "url": "https://cloudinary.com/...",
      "type": "image",
      "publicId": "eena-pins/messages/abc123"
    }
  ]
}
```

**Request Body (Images Only):**

```json
{
  "attachments": [
    {
      "url": "https://cloudinary.com/image1.jpg",
      "type": "image",
      "publicId": "eena-pins/messages/img1"
    },
    {
      "url": "https://cloudinary.com/image2.jpg",
      "type": "image",
      "publicId": "eena-pins/messages/img2"
    }
  ]
}
```

**Response:**

```json
{
  "id": "msg-003",
  "conversationId": "conv-123",
  "senderId": "user-456",
  "senderName": "John Doe",
  "senderAvatar": "https://...",
  "content": "Thank you!",
  "attachments": [
    {
      "url": "https://cloudinary.com/...",
      "type": "image",
      "publicId": "eena-pins/messages/abc123"
    }
  ],
  "isRead": false,
  "createdAt": "2025-02-05T10:40:00Z"
}
```

**Errors:**

- `400 Bad Request` - No content or attachments provided
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - No access to this conversation
- `404 Not Found` - Conversation not found

---

## Authentication

All endpoints require a valid NextAuth session. Include:

- Cookie: `next-auth.session-token` (or equivalent based on your setup)

If not authenticated, endpoints return:

```json
{
  "error": "Unauthorized"
}
```

---

## File Upload (Image Attachments)

Before sending a message with images:

### **POST /upload**

Upload an image to Cloudinary.

**Request:**

```
Content-Type: multipart/form-data

file: <binary image data>
```

**Response:**

```json
{
  "secure_url": "https://cloudinary.com/path/to/image.jpg",
  "public_id": "eena-pins/messages/abc123",
  "width": 1920,
  "height": 1080
}
```

**Then use in message POST:**

```json
{
  "content": "Check this out",
  "attachments": [
    {
      "url": "https://cloudinary.com/path/to/image.jpg",
      "type": "image",
      "publicId": "eena-pins/messages/abc123"
    }
  ]
}
```

---

## Status Codes

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 200  | OK - Successful GET request        |
| 201  | Created - Successful POST request  |
| 400  | Bad Request - Invalid input        |
| 401  | Unauthorized - Not logged in       |
| 403  | Forbidden - Access denied          |
| 404  | Not Found - Resource doesn't exist |
| 500  | Server Error - Internal error      |

---

## Rate Limiting

No built-in rate limiting currently. Consider adding if needed for production.

---

## WebSocket / Real-time (Not Implemented)

Currently, messages require manual refresh/polling. To add real-time:

- Implement WebSockets with `socket.io` or similar
- Or use a service like Pusher/Ably
- Or implement Server-Sent Events (SSE) for one-way push

---

## Example Client Code

### **Fetch Conversations (React)**

```typescript
const res = await fetch("/api/conversations");
const { data } = await res.json();
console.log(data);
```

### **Send Message (React)**

```typescript
const res = await fetch(`/api/conversations/${conversationId}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Hello!",
    attachments: [],
  }),
});
const newMessage = await res.json();
```

### **Upload Image (React)**

```typescript
const formData = new FormData();
formData.append("file", file);

const res = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
const { secure_url, public_id } = await res.json();

// Then use in message POST
```

---

**Last Updated:** February 6, 2026
