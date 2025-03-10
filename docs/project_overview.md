# YTMind: YouTube Content Intelligence Platform

## Project Overview

YTMind is a personal web platform that serves as a specialized YouTube assistant, combining competitor analysis with AI-powered content generation. The system is built around an intelligent chat interface that allows users to analyze specific YouTube channels on demand and generate content ideas based on that analysis.

## Core Features

### 1. YouTube Channel Analysis

- Extract key information from specified YouTube channels:
  - Total video count
  - Main topics and niches
  - Publication frequency
  - Channel start date
  - Most popular videos and their characteristics
  - Visual style and communication approach

### 2. Knowledge Base System

- Store analyzed channels as entities in the database
- Reference these channels in conversations with the assistant
- Use this information to contextualize responses
- Upload personal documents (thumbnail guides, scripts) to incorporate as base knowledge

### 3. Content Generation

- Generate video ideas based on trends and competitor analysis
- Create detailed scripts adapted to different styles and topics
- Suggest optimized titles
- Develop thumbnail concepts (textual descriptions)
- Recommend keywords and tags

### 4. Specialized Agents

- Create different specialized "agents" within the system
- Examples: thumbnail analysis agent, gaming script agent, educational content agent
- Combine knowledge across agents for comprehensive assistance

## Typical Workflow

1. Start a conversation with the assistant
2. Request analysis of a specific channel: "Analyze channel X"
3. System extracts and stores relevant information
4. Ask for specific details: "What type of thumbnails do they use?"
5. Request generation based on analysis: "Generate similar video ideas for my niche"
6. System provides contextualized suggestions
7. Refine requests: "Generate a detailed script for idea #3"

## Technical Specifications

- **Frontend**: Next.js with JavaScript and TailwindCSS
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **AI Model**: Gemini 2.0 Flash (with option to switch models)
- **UI**: Dark mode interface similar to ChatGPT

## MVP Scope

The initial version will focus on core functionality:

- Chat interface with AI agents
- Basic channel analysis capabilities
- Content generation features
- Knowledge storage and retrieval
- No authentication required (personal use)

## Future Enhancements

- Additional AI models for specialized reasoning
- Enhanced analysis capabilities
- More specialized agents
- Improved content generation
- Potential public access
