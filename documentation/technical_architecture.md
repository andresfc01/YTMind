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
  contextIds: [
    {
      type: String, // 'document', 'url', 'contextgroup'
      id: ObjectId // Reference to a Document, URL, or ContextGroup
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
      parameters: Object, // JSON Schema for function parameters
      implementation: String // Reference to function implementation in the codebase
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
  isDefault: Boolean, // Whether this is a default agent
  contextDocuments: [ObjectId], // References to Document objects
  contextUrls: [ObjectId] // References to URL objects
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
     thumbnailAnalysis: {
      summary: String, // General descriptive summary
      elements: {
        visual_style: {
          color_scheme: String, // bright / muted / neon / pastel / high-contrast
          lighting_mood: String, // cinematic / flat / dramatic / vibrant / dark / surreal
          visual_effects: [String], // glow / cutouts / drop shadow / motion blur / grain / collage
          design_consistency: String, // templated / freestyle / branded elements / recurring layout
          general_style: String // true crime thriller / motivational storytelling / comedic commentary / cinematic vlog
        },
        composition: {
          subject_focus: String, // facial close-up / object-centric / symbolic / abstract / text-heavy
          composition_style: String, // centered subject / rule of thirds / zoomed-in / layered / asymmetrical
          focus_point: String, // Specific area drawing immediate attention
          contrast_quality: String // How effectively contrast is used
        },
        faces: {
          present: Boolean,
          count: Number,
          expression_style: String, // exaggerated / intense / emotional / neutral / shocked
          expressions: [String] // Specific expressions identified
        },
        text_elements: {
          text_style: String, // big bold text / minimal text / handwritten / cinematic / outlined
          word_count: Number,
          font_style: String // Specific font characteristics
        },
        psychological_elements: {
          emotional_tone: String, // epic / mysterious / funny / intense / wholesome / inspirational
          thumbnail_strategy: String, // curiosity gap / shock value / emotional storytelling / visual metaphor / aesthetic intrigue
          curiosity_gap: String, // How the thumbnail creates curiosity
          emotional_appeal: String // Specific emotional triggers used
        },
        thumbnail_title_synergy: {
          complementary_elements: String, // How thumbnail and title work together
          curiosity_balance: String, // How curiosity is distributed between thumbnail and title
          redundancy_assessment: String // Whether information is effectively distributed
        }
      }
    },
    titleAnalysis: {
      summary: String, // General analysis of the title
      elements: {
        keywords: {
          seo_keywords: [String],
          buzzwords: [String],
          power_words: [String]
        },
        emotional_triggers: {
          primary_emotion: String, // curiosidad, miedo, deseo, etc.
          curiosity_factor: String,
          urgency_elements: String
        },
        techniques: {
          primary_technique: String, // autoridad, contraste, controversia, etc.
          secondary_techniques: [String],
          effectiveness_notes: String
        },
        styling: {
          capitalization: String, // standard, all-caps buzzwords, lowercase, etc.
          style_approach: String // "try hard" or "no try" style
        }
      }
    },
    scriptAnalysis: {
      summary: String, // General analysis of the script
      elements: {
        narrative_style: {
          tone_of_voice: String, // casual / dramatic / inspirational / comedic / informative / sarcastic / emotional
          narrative_structure: String, // linear / non-linear / mystery reveal / chronological / flashbacks / cliffhangers
          pacing: String, // fast-paced / slow-burn / punchy / rhythmic
          emotional_tone: String, // optimistic / tense / dramatic / hopeful / humorous / dark / uplifting
          general_style: String // motivational documentary / true crime storytelling / YouTube essayist / inspirational short film
        },
        hooks: {
          intro_hook: {
            hook_style: String, // question / shocking fact / emotional statement / cinematic build-up / dialogue snippet
            effectiveness: String,
            timing: String
          },
          narrative_hooks: [String], // Additional hooks throughout the video
          pattern_hooks: String // Recurring hook patterns
        },
        storytelling: {
          story_structure: String, // Modern Narrative Arc, CART, etc.
          moment_of_change: String, // The 5-second moment or transformation
          narrative_devices: [String], // repetition, analogies, metaphors, irony, open loops, suspense
          emotional_elements: [String] // Types of emotions evoked
        },
        language_elements: {
          point_of_view: String, // first-person / second-person / third-person / omniscient
          sentence_style: String, // short & snappy / long & descriptive / rhetorical / casual / poetic
          language_style: String, // simple / technical / poetic / edgy / motivational / street-smart
          common_devices: [String] // Specific language devices used
        },
        audience_approach: {
          addressing_style: String, // directly addressing viewer / narration without reference / conversational / character-based
          assumed_knowledge: String, // What knowledge level is assumed
          audience_relationship: String, // How creator positions themselves
          persuasion_techniques: [String]
        },
        visual_elements: {
          visual_cues: [String], // transitions, visual metaphors, on-screen text, cut timing
          visual_pacing: String, // How visual elements are timed
          visual_storytelling: String // How visuals support the narrative
        },
        call_to_actions: {
          types: [String],
          placement: [String],
          delivery_style: String,
          frequency: Number
        }
      }
    }
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
  processingStatus: String, // 'pending', 'processed', 'failed'
  processingResults: {
    chunks: [
      {
        content: String,
        index: Number
      }
    ],
    summary: String
  },
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### URL

```javascript
{
  _id: ObjectId,
  url: String,
  title: String,
  content: String, // Extracted content from the URL
  metadata: {
    domain: String,
    tags: [String], // User-defined tags
    description: String
  },
  processingStatus: String, // 'pending', 'processed', 'failed'
  processingResults: {
    chunks: [
      {
        content: String,
        index: Number
      }
    ],
    summary: String
  },
  fetchedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ContextGroup

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  items: [
    {
      type: String, // 'channel', 'video', 'document', 'url'
      id: ObjectId, // Reference to the item
      addedAt: Date
    }
  ],
  metadata: {
    tags: [String], // User-defined tags
    icon: String, // Icon identifier for the group
    color: String // Color for visual identification
  },
  createdAt: Date,
  updatedAt: Date,
  lastUsedAt: Date // Track when the group was last used in a conversation
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

### Context Group Endpoints

- `POST /api/context-groups` - Create a new context group
- `GET /api/context-groups` - Get all context groups
- `GET /api/context-groups/:id` - Get a specific context group
- `PUT /api/context-groups/:id` - Update a context group
- `DELETE /api/context-groups/:id` - Delete a context group
- `POST /api/context-groups/:id/items` - Add an item to a context group
- `DELETE /api/context-groups/:id/items/:itemId` - Remove an item from a context group

### YouTube Analysis Endpoints

- `POST /api/youtube/analyze-channel` - Analyze a YouTube channel
- `GET /api/youtube/channels` - Get all analyzed channels
- `GET /api/youtube/channels/:id` - Get a specific analyzed channel
- `GET /api/youtube/videos` - Get all analyzed videos
- `GET /api/youtube/videos/:id` - Get a specific analyzed video

### Document Endpoints

- `POST /api/documents` - Upload a new document
- `GET /api/documents` - Get all documents
- `
