# YTMind Technical Architecture

## System Architecture

YTMind follows a modern web application architecture with the following components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js        │     │  Next.js API    │     │  MongoDB        │
│  Frontend       │◄────┤  Routes         │◄────┤  Database       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲                      ▲                       ▲
         │                      │                       │
         │                      ▼                       │
         │              ┌─────────────────┐             │
         │              │                 │             │
         └──────────────┤  AI Services    │─────────────┘
                        │  (Gemini API)   │
                        │                 │
                        └─────────────────┘
```

### Components

1. **Frontend (Next.js + TailwindCSS)**

   - Chat interface similar to ChatGPT
   - Agent selection and management
   - Channel analysis visualization
   - Content generation interface
   - Dark mode UI

2. **Backend (Next.js API Routes)**

   - Chat message handling
   - YouTube data fetching and processing
   - AI model integration
   - Database operations

3. **Database (MongoDB)**

   - Collections:
     - Chats: Store conversation history
     - Agents: Store custom agent configurations
     - Channels: Store analyzed YouTube channel data
     - Videos: Store analyzed video data
     - Documents: Store uploaded knowledge base documents

4. **AI Services**
   - Primary: Gemini 2.0 Flash
   - Support for switching between different models
   - Specialized agents with different prompts/configurations

## Data Models

### Chat

```javascript
{
  _id: ObjectId,
  title: String,
  messages: [
    {
      role: String, // 'user' or 'assistant'
      content: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Agent

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  systemPrompt: String,
  model: String, // e.g., 'gemini-2.0-flash'
  createdAt: Date,
  updatedAt: Date
}
```

### Channel

```javascript
{
  _id: ObjectId,
  channelId: String, // YouTube channel ID
  name: String,
  description: String,
  videoCount: Number,
  mainTopics: [String],
  publicationFrequency: Number, // videos per month
  startDate: Date,
  popularVideos: [{ videoId: String, title: String, views: Number }],
  visualStyle: String,
  communicationStyle: String,
  analyzedAt: Date
}
```

### Video

```javascript
{
  _id: ObjectId,
  videoId: String, // YouTube video ID
  channelId: String, // Reference to parent channel
  title: String,
  description: String,
  publishedAt: Date,
  thumbnailUrl: String,
  tags: [String],
  duration: String,
  analyzedAt: Date
}
```

### Document

```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // e.g., 'script', 'thumbnail_guide'
  content: String,
  uploadedAt: Date
}
```

## API Endpoints

### Chat Endpoints

- `POST /api/chat` - Send a message to the AI assistant
- `GET /api/chats` - Get all chat histories
- `GET /api/chats/:id` - Get a specific chat history
- `DELETE /api/chats/:id` - Delete a chat history

### Agent Endpoints

- `POST /api/agents` - Create a new agent
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get a specific agent
- `PUT /api/agents/:id` - Update an agent
- `DELETE /api/agents/:id` - Delete an agent

### YouTube Analysis Endpoints

- `POST /api/youtube/analyze-channel` - Analyze a YouTube channel
- `GET /api/youtube/channels` - Get all analyzed channels
- `GET /api/youtube/channels/:id` - Get a specific analyzed channel
- `GET /api/youtube/videos` - Get all analyzed videos
- `GET /api/youtube/videos/:id` - Get a specific analyzed video

### Document Endpoints

- `POST /api/documents` - Upload a new document
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get a specific document
- `DELETE /api/documents/:id` - Delete a document

## External Services

### YouTube Data API

- Used to fetch channel and video data
- Required for channel analysis functionality

### Gemini API

- Primary AI model for chat and content generation
- Configurable to use different models

## Data Flow

1. **Channel Analysis Flow**

   - User requests channel analysis via chat
   - System fetches channel data from YouTube API
   - Data is processed and stored in MongoDB
   - AI generates analysis summary
   - Results are presented to user in chat

2. **Content Generation Flow**

   - User requests content generation
   - System retrieves relevant channel/video data from MongoDB
   - AI generates content based on stored data and user request
   - Generated content is presented to user in chat

3. **Agent Interaction Flow**
   - User selects or creates an agent
   - System loads agent configuration
   - User interacts with the agent via chat
   - Agent responses are based on its specialized configuration
