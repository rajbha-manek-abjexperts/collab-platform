# Real-time Collaboration Platform - SPEC.md

## Project Overview
- **Name**: Collab Platform
- **Type**: Real-time Collaboration SaaS
- **Stack**: NestJS + Next.js 14 + Supabase + Turborepo

## Core Features

### 1. Real-time Whiteboard
- Canvas-based drawing
- Multiple tool types (pen, shapes, text, sticky notes)
- Color palette and brush sizes
- Undo/redo functionality
- Export to image/PDF
- Real-time sync via Supabase Realtime

### 2. Document Collaboration
- Rich text editor (Tiptap)
- Real-time cursor positions
- Live typing indicators
- Version history
- Comments and annotations

### 3. Video/Audio Calls (WebRTC)
- Peer-to-peer video calls
- Screen sharing
- Mute/unmute controls
- Grid layout for multiple participants

### 4. User Presence
- Online/offline status
- Active document indicators
- Cursor positions visible

### 5. Version History
- Auto-save with timestamps
- Restore previous versions
- Compare versions

### 6. Comments & Reactions
- Inline comments on canvas/documents
- Emoji reactions
- @mentions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | NestJS (TypeScript) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| WebRTC | Simple-Peer |
| UI | Tailwind + shadcn/ui |

## Database Schema

### Tables
- users (Supabase Auth)
- workspaces
- documents
- whiteboard_sessions
- comments
- reactions
- versions

## Project Structure
```
collab-platform/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/          # Shared UI components
│   └── config/      # Shared config
├── supabase/
│   └── migrations/  # Database migrations
└── turbo.json
```

## Development Phases

### Phase 1: Setup & Auth
- Project setup with Turborepo
- Supabase configuration
- Authentication flow

### Phase 2: Core Infrastructure
- NestJS API setup
- Database migrations
- WebSocket gateway

### Phase 3: Whiteboard
- Canvas implementation
- Real-time sync
- Drawing tools

### Phase 4: Document Editor
- Rich text editor
- Collaboration features
- Version history

### Phase 5: Video Calls
- WebRTC integration
- Screen sharing
- Controls

### Phase 6: Polish & Deploy
- UI improvements
- Testing
- Deployment
