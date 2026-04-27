# UpCycle 🔄

> **Breathing new life into things** — A peer-to-peer marketplace for buying and selling second-hand goods, with real-time in-app messaging between buyers and sellers.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Database Models](#database-models)
- [API Reference](#api-reference)
- [WebSocket Protocol](#websocket-protocol)
- [Authentication](#authentication)
- [Roadmap](#roadmap)

---

## Overview

UpCycle is a full-stack Next.js application that enables users to list, browse, and purchase second-hand products. When a buyer finds a product they're interested in, they can open a **real-time chat room** directly with the seller — powered by a dedicated WebSocket server — to negotiate, ask questions, and close the deal.

---

## Features

- 🛍️ **Product Marketplace** — Browse a grid of second-hand listings with image, price, and seller info.
- 🔍 **Search & Filters** — Search products and apply category filters on the home page.
- 📄 **Product Detail Pages** — View full product details, including seller name and listing date.
- 💬 **Real-Time Chat** — Buyers can initiate a persistent, private chat room with sellers. Messages are delivered via WebSocket and persisted to MongoDB.
- 🔁 **Auto-Reconnect** — The chat client automatically attempts to reconnect if the WebSocket connection drops.
- 📜 **Message History** — The last 100 messages in a chat room are loaded from the database on join.
- 🔒 **Authentication** — All routes (except sign-in/sign-up) are protected via Clerk authentication.
- 🧾 **Persistent Chat Rooms** — Chat rooms are uniquely identified by buyer identity + product ID, so a room is never duplicated.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript / JavaScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + Radix UI |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Authentication** | [Clerk](https://clerk.com/) |
| **API Layer** | [Elysia.js](https://elysiajs.com/) (mounted as a Next.js API route) |
| **HTTP Client** | [Eden (Elysia client)](https://elysiajs.com/eden/overview.html) + TanStack Query |
| **Real-Time** | Node.js `ws` WebSocket server (standalone, port 3001) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Font** | [Poppins](https://fonts.google.com/specimen/Poppins) (Google Fonts) |

---

## Architecture

UpCycle runs two concurrent processes:

```
┌─────────────────────────────────────────────┐
│              Browser (Client)               │
│                                             │
│  Next.js Pages ──── HTTP/REST ────► Next.js │
│       │                              App    │
│       │                           (port 3000)
│       │                               │     │
│       │                         Elysia API  │
│       │                               │     │
│       │                          MongoDB    │
│       │                                     │
│       └──── WebSocket (ws://) ──► WS Server │
│                                  (port 3001)│
└─────────────────────────────────────────────┘
```

- **Next.js App (port 3000)**: Serves all pages, handles authentication middleware via Clerk, and exposes a REST API via Elysia for creating/looking up chat rooms.
- **WebSocket Server (port 3001)**: A standalone Node.js process (`src/app/server/websocket.ts`) that manages real-time messaging — joining rooms, broadcasting messages, sending message history, and handling disconnections.

---

## Project Structure

```
nextdesk/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── [[...slug]]/
│   │   │       └── route.ts          # Elysia-powered REST API (room creation)
│   │   ├── chat/
│   │   │   └── [username]/
│   │   │       └── [roomId]/
│   │   │           └── page.tsx      # Real-time chat UI
│   │   ├── product/
│   │   │   └── [productId]/
│   │   │       └── page.tsx          # Product detail page
│   │   ├── server/
│   │   │   └── websocket.ts          # Standalone WebSocket server
│   │   ├── sign-in/                  # Clerk sign-in page
│   │   ├── sign-up/                  # Clerk sign-up page
│   │   ├── layout.tsx                # Root layout (Clerk + Query providers)
│   │   └── page.tsx                  # Home / marketplace listing page
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── filters.tsx               # Category filter bar
│   │   ├── footer.tsx                # Site footer
│   │   ├── header.tsx                # Navigation header
│   │   ├── productCard.tsx           # Product listing card
│   │   └── providers.tsx             # TanStack Query provider
│   ├── data/
│   │   └── values.json               # Static product seed data
│   ├── dbConfig/
│   │   └── dbConfig.ts               # Mongoose connection helper
│   ├── lib/
│   │   └── client.ts                 # Eden (Elysia type-safe HTTP client)
│   ├── models/
│   │   ├── ProductModel.js           # Mongoose Product schema
│   │   ├── RoomModel.js              # Mongoose Room schema
│   │   └── messageModel.js           # Mongoose Message schema
│   └── proxy.ts                      # Clerk auth middleware
├── .env                              # Environment variables (gitignored)
├── components.json                   # shadcn/ui config
├── next.config.ts                    # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Clerk** account and application

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nextdesk

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root of the project with the following keys:

```env
# MongoDB connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Clerk authentication keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Running the App

UpCycle requires **two processes** to run simultaneously: the Next.js app and the WebSocket server.

**Terminal 1 — Next.js development server:**
```bash
npm run dev
```
> Starts the Next.js app at [http://localhost:3000](http://localhost:3000)

**Terminal 2 — WebSocket server:**
```bash
npm run chat-server
```
> Starts the WebSocket server at `ws://localhost:3001`

---

## Database Models

### Room

Stores chat room metadata linking a buyer and seller for a specific product.

| Field | Type | Description |
|---|---|---|
| `buyer` | `String` | Full name of the buyer |
| `seller` | `String` | Full name of the seller |
| `roomId` | `String` | Unique ID: `{buyerName}+{productId}` |
| `connected` | `[String]` | Active participants (max 2) |
| `isFull` | `Boolean` | Auto-set: `true` when 2 users are in the room |
| `createdAt` | `Date` | Room creation timestamp |

### Message

Stores individual chat messages, indexed by `roomId` and `timestamp`.

| Field | Type | Description |
|---|---|---|
| `roomId` | `String` | The room this message belongs to |
| `sender` | `String` | Username of the message author |
| `text` | `String` | Message body (max 2000 chars) |
| `timestamp` | `Date` | Time the message was sent |

### Product

Stores product listings.

| Field | Type | Description |
|---|---|---|
| `name` | `String` | Product title |
| `price` | `Number` | Listing price |
| `image` | `Buffer` | Product image (binary) |
| `listedBy` | `String` | Seller's display name |
| `sellerId` | `String` | Clerk user ID of the seller |
| `date` | `Date` | Date the item was listed |

---

## API Reference

The REST API is built with **Elysia.js** and mounted at `/api` within Next.js.

### `POST /api/room`

Creates a new chat room between a buyer and seller, or returns the existing room if one already exists for the given `roomId`.

**Request Body:**
```json
{
  "seller": "John Doe",
  "buyer": "Jane Smith",
  "roomId": "Jane Smith+product-abc-123"
}
```

**Response (200):**
```json
{
  "seller": "John Doe",
  "buyer": "Jane Smith",
  "roomId": "Jane Smith+product-abc-123"
}
```

**Response (500):**
```json
{
  "error": "Failed to create room"
}
```

> **Note:** Requires the user to be authenticated via Clerk. The buyer identity is also validated server-side using `currentUser()`.

---

## WebSocket Protocol

Connect to `ws://localhost:3001`. All messages are JSON-encoded.

### Client → Server (Incoming Messages)

#### `join` — Join a chat room
```json
{
  "type": "join",
  "roomId": "Jane Smith+product-abc-123",
  "username": "Jane Smith"
}
```

#### `message` — Send a chat message
```json
{
  "type": "message",
  "roomId": "Jane Smith+product-abc-123",
  "username": "Jane Smith",
  "text": "Is this still available?"
}
```

#### `leave` — Leave the current room
```json
{
  "type": "leave",
  "roomId": "Jane Smith+product-abc-123",
  "username": "Jane Smith"
}
```

---

### Server → Client (Outgoing Messages)

#### `history` — Chat history on room join (last 100 messages)
```json
{
  "type": "history",
  "roomId": "Jane Smith+product-abc-123",
  "messages": [
    { "sender": "John Doe", "text": "Yes!", "timestamp": "2026-04-27T06:00:00.000Z" }
  ]
}
```

#### `message` — A new chat message broadcast
```json
{
  "type": "message",
  "roomId": "...",
  "sender": "Jane Smith",
  "text": "Is this still available?",
  "timestamp": "2026-04-27T06:01:00.000Z"
}
```

#### `system` — System notification (user joined/left)
```json
{
  "type": "system",
  "text": "John Doe left the room",
  "timestamp": "2026-04-27T06:02:00.000Z"
}
```

#### `room_update` — Connected participants list update
```json
{
  "type": "room_update",
  "roomId": "...",
  "connected": ["Jane Smith", "John Doe"]
}
```

#### `error` — Error response
```json
{
  "type": "error",
  "text": "roomId and username required"
}
```

---

## Authentication

UpCycle uses **Clerk** for user authentication. The middleware (`src/proxy.ts`) protects all routes by default, allowing only `/sign-in` and `/sign-up` as public routes.

- Users must be signed in to browse products, view product details, and chat.
- The user's `fullName` (falling back to `username`) is used as their display identity throughout the app.
- The chat client only initiates a WebSocket connection after Clerk confirms the user is signed in.

---

## Roadmap

- [ ] Allow users to list and upload their own products
- [ ] Image upload support (replace static `values.json` with database-driven listings)
- [ ] Orders and transaction history page
- [ ] In-app notifications for new messages
- [ ] Mobile-responsive improvements
- [ ] Voice/video call integration (PhoneCall button is stubbed in the chat UI)
- [ ] Report/flag system for listings and users
- [ ] Search functionality connected to the database
