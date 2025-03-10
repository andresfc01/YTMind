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
  agentId: ObjectId, // Reference to the agent used (optional, can be null)
  messages: [
    {
      role: String, // 'user' or 'assistant'
      content: String,
      timestamp: Date,
      usedAgentId: ObjectId // Reference to agent used for this specific message (optional)
    }
  ],
  createdAt: Date,
  updatedAt: Date,
  model: String // AI model used for this chat
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
  functions: [
    {
      name: String,
      description: String,
      parameters: Object // JSON Schema for function parameters
    }
  ],
  usesAgents: [
    {
      agentId: ObjectId, // Reference to another agent this agent can use
      purpose: String // Description of when/why this agent is used
    }
  ],
  icon: String, // Icon identifier
  category: String, // e.g., 'analysis', 'content', 'seo'
  createdAt: Date,
  updatedAt: Date,
  isDefault: Boolean // Whether this is a default agent
}
```

### Channel

```javascript
{
  _id: ObjectId,
  channelId: String, // YouTube channel ID
  name: String,
  description: String,
  statistics: {
    videoCount: Number,
    subscriberCount: Number, // If available
    viewCount: Number // If available
  },
  analysis: {
    targetAudience: String, // Description of the target audience
    mainTopics: [String], // Main topics covered by the channel
    publicationFrequency: Number, // Videos per month
    visualStyle: String, // Description of visual style
    communicationStyle: String, // Description of communication approach
    popularVideosAnalysis: [
      {
        videoId: String,
        title: String,
        views: Number,
        engagement: Number, // Likes/views ratio or similar metric
        keyFactors: [String] // Factors contributing to video success
      }
    ],
    popularThumbnailsAnalysis: {
      commonElements: [String], // Common elements in thumbnails
      colorSchemes: [String], // Common color schemes
      textUsage: String, // How text is used in thumbnails
      imageComposition: String // Common image composition patterns
    },
    popularTitlesAnalysis: {
      patterns: [String], // Common title patterns
      lengthStats: { min: Number, max: Number, avg: Number }, // Title length statistics
      keywordsUsage: [{ keyword: String, frequency: Number }] // Common keywords
    }
  },
  metadata: {
    thumbnailUrl: String, // Channel thumbnail URL
    country: String, // Channel country if available
    startDate: Date, // When the channel was created
    customUrl: String // Custom URL if available
  },
  analyzedAt: Date, // When the channel was last analyzed
  createdAt: Date,
  updatedAt: Date
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
  statistics: {
    viewCount: Number,
    likeCount: Number,
    commentCount: Number
  },
  metadata: {
    publishedAt: Date,
    thumbnailUrl: String,
    duration: String, // ISO 8601 duration format
    tags: [String],
    category: String
  },
  analysis: {
    topics: [String], // Topics covered in the video
    keywords: [String], // Extracted keywords
    thumbnailAnalysis: String, // Analysis of thumbnail
    titleAnalysis: String, // Analysis of title pattern
    hooks: [String], // Identified hooks in the video
    callToActions: [String] // Identified CTAs in the video
    scriptAnalysis: {}
  },
  analyzedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Document

```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // e.g., 'script', 'thumbnail_guide'
  content: String,
  metadata: {
    format: String, // e.g., 'markdown', 'text'
    tags: [String], // User-defined tags
    description: String // Document description
  },
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
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
- `GET /api/agents/:id/functions` - Get functions for a specific agent
- `GET /api/agents/:id/used-agents` - Get agents used by a specific agent

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
   - Agent may use other specialized agents for specific tasks
   - Agent responses are based on its specialized configuration and functions

4. **Multi-Agent Collaboration Flow**

   - Primary agent receives user request
   - Primary agent determines if specialized agents are needed
   - Primary agent delegates specific tasks to specialized agents
   - Specialized agents process their tasks and return results
   - Primary agent integrates results and provides final response to user
