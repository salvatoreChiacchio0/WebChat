# Chat Microservice

This project is a **chat microservice** developed as part of an Advanced Programming exam. It provides real-time and RESTful chat functionalities, user authentication via Firebase, and leverages MongoDB and Redis for data storage and performance.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [REST API](#rest-api)
  - [WebSocket API](#websocket-api)
- [Message Payload Example](#message-payload-example)
- [Swagger Documentation](#swagger-documentation)
- [License](#license)

---

## Features
- User authentication with Firebase
- Real-time messaging via WebSocket (Socket.IO)
- RESTful API for chat history and message creation
- MongoDB for message persistence
- Redis for user session management and message delivery
- Dockerized for easy deployment

## Tech Stack
- **NestJS** (Node.js framework)
- **MongoDB** (NoSQL database)
- **Redis** (in memory data store)
- **Firebase** (authentication)
- **Socket.IO** (real-time communication)
- **Docker & Docker Compose**

## Project Structure
```
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── chat/
│   │   ├── chat.controller.ts   # REST endpoints
│   │   ├── chat.gateway.ts      # WebSocket gateway
│   │   ├── chat.service.ts      # Business logic
│   │   └── schemas/
│   │       └── message.schema.ts
│   ├── auth/
│   │   ├── auth.controller.ts   # Auth endpoints
│   │   ├── firebase-auth.guard.ts
│   │   └── auth.module.ts
│   └── redis/
│       └── redis.module.ts      # Redis integration
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Local Development
```bash
npm install
npm run start:dev
```

### Using Docker Compose
```bash
docker-compose up --build
```
- The API will be available at `http://localhost:3001`
- Swagger docs at `http://localhost:3001/api`

## Usage

### Authentication
All endpoints are protected by Firebase authentication. Obtain a Firebase ID token via the `/auth/login` endpoint:

```http
POST /auth/login
Content-Type: application/json
{
  "email": "your@email.com",
  "password": "yourPassword"
}
```
Response:
```json
{
  "idToken": "...",
  "refreshToken": "..."
}
```
Use the `idToken` as a Bearer token in the `Authorization` header for all requests.

### REST API
- **Get all chats for a user:**
  ```http
  GET /chat/{userId}
  Authorization: Bearer <idToken>
  ```
- **Send a message:**
  ```http
  POST /chat
  Authorization: Bearer <idToken>
  Content-Type: application/json
  {
    "senderId": "user1",
    "receiverId": "user2",
    "content": "Hello!"
  }
  ```

### WebSocket API
Connect via Socket.IO to `ws://localhost:3001` with authentication:

```js
const socket = io('http://localhost:3001', {
  auth: { token: '<idToken>' }
});

// Send a message
socket.emit('send', {
  senderId: 'user1',
  receiverId: 'user2',
  content: 'Hello!'
});

// Listen for incoming messages
socket.on('receive', (msg) => {
  console.log('New message:', msg);
});
```

## Message Payload Example
```json
{
  "_id": "string",
  "senderId": "string",
  "receiverId": "string",
  "content": "string",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Swagger Documentation
Interactive API docs are available at: [http://localhost:3001/api](http://localhost:3001/api)

---

## License
This project is for educational purposes (Sapienza - Laboratory of Advanced Programming).
