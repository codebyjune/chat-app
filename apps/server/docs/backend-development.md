# Chat Backend Implemented Features

This document contains only the functionality that is currently implemented in the backend.

## Base URL

```text
http://localhost:3000
```

## CORS

The backend enables CORS in `src/main.ts` with the following configuration:

```ts
app.enableCors({
  origin: true,
  credentials: true,
});
```

## Environment Variables

Required:

```env
JWT_SECRET=your_jwt_secret
```

Optional:

```env
PORT=3000
```

## Implemented Modules

- Auth
- User
- Friend
- Message
- Chat WebSocket gateway

## Authentication

### Auth Rules

- HTTP protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

- WebSocket connections require the JWT token in Socket.IO `auth.token`.

### AuthUser Response

```json
{
  "id": 1,
  "username": "june",
  "email": "june@example.com",
  "createdAt": "2026-05-03T12:00:00.000Z"
}
```

### Login Response

```json
{
  "accessToken": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "june",
    "email": "june@example.com",
    "createdAt": "2026-05-03T12:00:00.000Z"
  }
}
```

### Register

- Method: `POST`
- Path: `/auth/register`
- Auth required: `No`

Request headers:

```http
Content-Type: application/json
```

Request body:

```json
{
  "username": "june",
  "email": "june@example.com",
  "password": "123456"
}
```

Validation:

- `username`: required, string, length `3-50`
- `email`: required, valid email
- `password`: required, string, minimum length `6`

Success response:

```json
{
  "message": "Registration successful"
}
```

Possible errors:

- `400 Bad Request`
- `409 Conflict`

### Login

- Method: `POST`
- Path: `/auth/login`
- Auth required: `No`

Request headers:

```http
Content-Type: application/json
```

Request body:

```json
{
  "email": "june@example.com",
  "password": "123456"
}
```

Validation:

- `email`: required, valid email
- `password`: required, string, minimum length `6`

Success response:

```json
{
  "accessToken": "your_jwt_token",
  "user": {
    "id": 1,
    "username": "june",
    "email": "june@example.com",
    "createdAt": "2026-05-03T12:00:00.000Z"
  }
}
```

Possible errors:

- `400 Bad Request`
- `401 Unauthorized`

### Get Current User Profile

- Method: `GET`
- Path: `/auth/profile`
- Auth required: `Yes`

Request headers:

```http
Authorization: Bearer <accessToken>
```

Success response:

```json
{
  "id": 1,
  "username": "june",
  "email": "june@example.com",
  "createdAt": "2026-05-03T12:00:00.000Z"
}
```

## Friend System

### Implemented Friend Rules

- Users can send friend requests.
- The request receiver can accept or reject the request.
- Users can list accepted friends.
- Users can list pending friend requests addressed to themselves.
- Users can remove an accepted friendship.
- Only accepted friends can chat.

### Friend Request Response

```json
{
  "id": 1,
  "status": "pending",
  "requester": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  },
  "addressee": {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com"
  },
  "createdAt": "2026-05-03T12:20:00.000Z",
  "updatedAt": "2026-05-03T12:20:00.000Z"
}
```

### Friend List Item

```json
{
  "friendshipId": 1,
  "friend": {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com"
  },
  "createdAt": "2026-05-03T12:20:00.000Z"
}
```

### Send Friend Request

- Method: `POST`
- Path: `/friends/request`
- Auth required: `Yes`

Request headers:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Request body:

```json
{
  "userId": 2
}
```

Behavior:

- The current user sends a request to the target user.
- Users cannot add themselves.
- If a friendship already exists as `accepted`, the request fails.
- If a friendship already exists as `pending`, the request fails.
- If an older friendship exists as `rejected`, it is reused and switched back to `pending`.

Success response:

```json
{
  "id": 1,
  "status": "pending",
  "requester": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  },
  "addressee": {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com"
  },
  "createdAt": "2026-05-03T12:20:00.000Z",
  "updatedAt": "2026-05-03T12:20:00.000Z"
}
```

Possible errors:

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`

### Accept Friend Request

- Method: `PATCH`
- Path: `/friends/request/:id/accept`
- Auth required: `Yes`

Example:

```http
PATCH /friends/request/1/accept
Authorization: Bearer <accessToken>
```

Behavior:

- Only the addressee can accept the request.
- Only `pending` requests can be accepted.

Success response:

```json
{
  "id": 1,
  "status": "accepted",
  "requester": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  },
  "addressee": {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com"
  },
  "createdAt": "2026-05-03T12:20:00.000Z",
  "updatedAt": "2026-05-03T12:21:00.000Z"
}
```

Possible errors:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

### Reject Friend Request

- Method: `PATCH`
- Path: `/friends/request/:id/reject`
- Auth required: `Yes`

Example:

```http
PATCH /friends/request/1/reject
Authorization: Bearer <accessToken>
```

Behavior:

- Only the addressee can reject the request.
- Only `pending` requests can be rejected.

Success response:

```json
{
  "id": 1,
  "status": "rejected",
  "requester": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  },
  "addressee": {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com"
  },
  "createdAt": "2026-05-03T12:20:00.000Z",
  "updatedAt": "2026-05-03T12:21:00.000Z"
}
```

Possible errors:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

### Get Friend List

- Method: `GET`
- Path: `/friends`
- Auth required: `Yes`

Request headers:

```http
Authorization: Bearer <accessToken>
```

Success response:

```json
[
  {
    "friendshipId": 1,
    "friend": {
      "id": 2,
      "username": "bob",
      "email": "bob@example.com"
    },
    "createdAt": "2026-05-03T12:20:00.000Z"
  }
]
```

### Get Pending Friend Requests

- Method: `GET`
- Path: `/friends/requests/pending`
- Auth required: `Yes`

Request headers:

```http
Authorization: Bearer <accessToken>
```

Success response:

```json
[
  {
    "id": 1,
    "status": "pending",
    "requester": {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com"
    },
    "addressee": {
      "id": 2,
      "username": "bob",
      "email": "bob@example.com"
    },
    "createdAt": "2026-05-03T12:20:00.000Z",
    "updatedAt": "2026-05-03T12:20:00.000Z"
  }
]
```

### Delete Friend

- Method: `DELETE`
- Path: `/friends/:friendId`
- Auth required: `Yes`

Request headers:

```http
Authorization: Bearer <accessToken>
```

Important:

- `friendId` is the other user's id.

Example:

```http
DELETE /friends/2
Authorization: Bearer <accessToken>
```

Success response:

- Status: `200 OK`
- Response body: empty

Possible errors:

- `401 Unauthorized`
- `404 Not Found`

## One-to-One Message History

### Message Response

```json
{
  "id": 1,
  "content": "hello",
  "sentAt": "2026-05-03T12:30:00.000Z",
  "senderId": 1,
  "receiverId": 2
}
```

### Get Conversation History

- Method: `GET`
- Path: `/messages/conversation/:userId`
- Auth required: `Yes`

Request headers:

```http
Authorization: Bearer <accessToken>
```

Example:

```http
GET /messages/conversation/2
Authorization: Bearer <accessToken>
```

Behavior:

- Returns the full message history between the current user and the target user.
- Messages are sorted by `sentAt` ascending.
- Only accepted friends can view history.

Success response:

```json
[
  {
    "id": 1,
    "content": "hello",
    "sentAt": "2026-05-03T12:30:00.000Z",
    "senderId": 1,
    "receiverId": 2
  },
  {
    "id": 2,
    "content": "hi",
    "sentAt": "2026-05-03T12:31:00.000Z",
    "senderId": 2,
    "receiverId": 1
  }
]
```

Possible errors:

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`

Example not-friends error:

```json
{
  "statusCode": 400,
  "message": "Only friends can view chat history",
  "error": "Bad Request"
}
```

## Real-Time One-to-One Chat

The backend uses Socket.IO.

### Connection

Frontend example:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken,
  },
});
```

Behavior:

- The backend reads `client.handshake.auth.token`.
- The backend verifies the JWT.
- If verification succeeds, the user joins room `user:<userId>`.
- If verification fails, the backend emits `chat:error` and disconnects the socket.

Unauthorized event example:

```json
{
  "message": "Unauthorized"
}
```

### Event: `chat:send`

Direction:

- Client to server

Payload:

```json
{
  "receiverId": 2,
  "content": "hello"
}
```

Validation:

- `receiverId`: integer, minimum `1`
- `content`: required string, maximum length `1000`

Behavior:

- The sender must be authenticated.
- The sender cannot send a message to themselves.
- The receiver must exist.
- The sender and receiver must already be accepted friends.
- The backend stores the message in the database.
- The backend emits `chat:message` to both sender and receiver rooms.

### Event: `chat:message`

Direction:

- Server to client

Payload:

```json
{
  "id": 1,
  "content": "hello",
  "sentAt": "2026-05-03T12:40:00.000Z",
  "senderId": 1,
  "receiverId": 2
}
```

Frontend example:

```ts
socket.on('chat:message', (message) => {
  console.log(message);
});
```

### Event: `chat:error`

Direction:

- Server to client

Example payload:

```json
{
  "message": "Unauthorized"
}
```

## Implemented Business Flow

### Register and Login

1. Register with `POST /auth/register`
2. Login with `POST /auth/login`
3. Save `accessToken`
4. Save returned `user`
5. Use `GET /auth/profile` to load current user info when needed

### Become Friends

1. User A sends a request with `POST /friends/request`
2. User B checks `GET /friends/requests/pending`
3. User B accepts with `PATCH /friends/request/:id/accept`
4. Both users can now see each other in `GET /friends`

### Chat

1. Login and get `accessToken`
2. Connect Socket.IO with `auth.token`
3. Load conversation history with `GET /messages/conversation/:userId`
4. Send messages with `chat:send`
5. Receive real-time messages through `chat:message`
