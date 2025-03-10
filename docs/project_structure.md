# YTMind Project Structure

This document outlines the folder structure and key files in the YTMind project.

## Root Directory

```
YTMind/
├── docs/                  # Project documentation
├── public/                # Static assets
├── src/                   # Source code
├── .env.example           # Example environment variables
├── .env.local             # Local environment variables (gitignored)
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore file
├── next.config.js         # Next.js configuration
├── package.json           # Project dependencies
├── README.md              # Project overview
└── tailwind.config.js     # TailwindCSS configuration
```

## Documentation

```
docs/
├── api_integration.md     # API integration details
├── database_schema.md     # MongoDB schema documentation
├── implementation_roadmap.md # Development roadmap
├── project_overview.md    # High-level project description
├── project_structure.md   # This file
├── sample_prompts.md      # Sample agent prompts
├── specialized_agents.md  # Agent descriptions
├── technical_architecture.md # System architecture
└── ui_design.md           # UI/UX design guidelines
```

## Source Code

```
src/
├── app/                   # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication routes (future)
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions and services
├── models/                # Data models
└── styles/                # Component-specific styles
```

## API Routes

```
src/app/api/
├── agents/                # Agent management endpoints
│   ├── route.js           # GET, POST handlers
│   └── [id]/              # Agent-specific operations
│       └── route.js       # GET, PUT, DELETE handlers
├── chat/                  # Chat endpoints
│   └── route.js           # POST handler for chat messages
├── chats/                 # Chat history endpoints
│   ├── route.js           # GET, POST handlers
│   └── [id]/              # Chat-specific operations
│       └── route.js       # GET, DELETE handlers
├── documents/             # Document management endpoints
│   ├── route.js           # GET, POST handlers
│   └── [id]/              # Document-specific operations
│       └── route.js       # GET, DELETE handlers
└── youtube/               # YouTube data endpoints
    ├── analyze-channel/   # Channel analysis endpoint
    │   └── route.js       # POST handler
    ├── channels/          # Channel data endpoints
    │   ├── route.js       # GET handler
    │   └── [id]/          # Channel-specific operations
    │       └── route.js   # GET handler
    └── videos/            # Video data endpoints
        ├── route.js       # GET handler
        └── [id]/          # Video-specific operations
            └── route.js   # GET handler
```

## Components

```
src/components/
├── agents/                # Agent-related components
│   ├── AgentCard.jsx      # Agent selection card
│   ├── AgentForm.jsx      # Agent creation/editing form
│   ├── AgentList.jsx      # List of available agents
│   └── AgentSelector.jsx  # Agent selection dropdown
├── chat/                  # Chat-related components
│   ├── ChatInput.jsx      # Message input field
│   ├── ChatMessage.jsx    # Individual chat message
│   ├── ChatMessages.jsx   # Chat message container
│   └── ChatSidebar.jsx    # Chat history sidebar
├── layout/                # Layout components
│   ├── Header.jsx         # Application header
│   ├── MainLayout.jsx     # Main application layout
│   ├── Sidebar.jsx        # Main sidebar
│   └── ThemeToggle.jsx    # Dark/light mode toggle
├── ui/                    # Reusable UI components
│   ├── Button.jsx         # Button component
│   ├── Card.jsx           # Card component
│   ├── Dropdown.jsx       # Dropdown component
│   ├── Input.jsx          # Input component
│   ├── Modal.jsx          # Modal component
│   └── Spinner.jsx        # Loading spinner
└── youtube/               # YouTube data components
    ├── ChannelAnalysis.jsx # Channel analysis display
    ├── ChannelCard.jsx    # Channel information card
    ├── VideoCard.jsx      # Video information card
    └── VideoList.jsx      # List of videos
```

## Utility Functions and Services

```
src/lib/
├── api/                   # API client functions
│   ├── agents.js          # Agent API functions
│   ├── chat.js            # Chat API functions
│   ├── documents.js       # Document API functions
│   └── youtube.js         # YouTube API functions
├── db/                    # Database utilities
│   ├── connect.js         # MongoDB connection
│   ├── models/            # Mongoose models
│   └── repositories/      # Data access functions
├── ai/                    # AI-related utilities
│   ├── gemini.js          # Gemini API client
│   ├── prompts.js         # System prompts
│   └── streaming.js       # Streaming response utilities
├── youtube/               # YouTube data utilities
│   ├── analyzer.js        # Channel/video analysis functions
│   ├── api.js             # YouTube Data API client
│   └── parser.js          # Response parsing utilities
└── utils/                 # General utilities
    ├── date.js            # Date formatting functions
    ├── string.js          # String manipulation functions
    └── validation.js      # Input validation functions
```

## Data Models

```
src/models/
├── Agent.js               # Agent model
├── Channel.js             # YouTube channel model
├── Chat.js                # Chat model
├── Document.js            # Document model
└── Video.js               # YouTube video model
```

## Key Files

### Configuration Files

- **next.config.js**: Next.js configuration, including API rewrites and environment variables
- **tailwind.config.js**: TailwindCSS theme configuration, including dark mode settings
- **.env.example**: Template for environment variables
- **package.json**: Project dependencies and scripts

### Core Application Files

- **src/app/layout.js**: Root layout component that wraps all pages
- **src/app/page.js**: Home page component
- **src/lib/db/connect.js**: MongoDB connection utility
- **src/lib/ai/gemini.js**: Gemini API integration
- **src/lib/youtube/api.js**: YouTube Data API integration

## File Naming Conventions

- **React Components**: PascalCase (e.g., `ChatMessage.jsx`)
- **API Routes**: kebab-case directories with `route.js` files
- **Utility Functions**: camelCase (e.g., `formatDate.js`)
- **Database Models**: PascalCase (e.g., `Channel.js`)

## Import Conventions

- Absolute imports are used for better readability:

```javascript
// Instead of
import Button from "../../../components/ui/Button";

// Use
import Button from "@/components/ui/Button";
```

This is configured in `jsconfig.json` with path aliases.
