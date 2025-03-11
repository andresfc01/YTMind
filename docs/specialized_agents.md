# YTMind Specialized Agents

## Overview

YTMind utilizes specialized AI agents to provide targeted assistance for different aspects of YouTube content creation. Each agent is configured with specific system prompts, functions, and context to excel in its domain.

## Core Functions

Before specialized agents are created, YTMind implements a set of core functions that agents can use:

### YouTube Data Functions

- **channelInfo**: Fetch basic information about a YouTube channel
- **channelVideos**: Get videos from a specific channel
- **videoDetails**: Retrieve detailed information about a video
- **channelComparison**: Compare statistics between multiple channels

### Content Analysis Functions

- **topicExtraction**: Extract main topics from video content
- **styleAnalysis**: Analyze visual and communication style
- **audienceAnalysis**: Identify likely target audience
- **trendAnalysis**: Detect trending topics in a niche

### Content Generation Functions

- **ideaGeneration**: Generate video ideas based on inputs
- **scriptOutlining**: Create structured outlines for videos
- **scriptWriting**: Generate complete scripts with hooks and CTAs
- **thumbnailConcept**: Describe effective thumbnail designs
- **seoOptimization**: Generate SEO metadata for videos

## Context Systems

Agents can utilize two types of context:

### Document Context

- User-uploaded documents that provide reference material
- Documents are processed and made available to agents during chat
- Examples: scripts, video notes, brand guidelines

### URL Context

- User-saved URLs that provide reference material
- Content from URLs is extracted, processed, and made available to agents
- Examples: competitor videos, industry articles, trend reports

## Core Agents

### 1. Channel Analyst Agent

**Purpose**: Analyze YouTube channels to extract valuable insights.

**Core Functions Used**:

- channelInfo
- channelVideos
- topicExtraction
- styleAnalysis
- audienceAnalysis
- channelComparison

**Capabilities**:

- Extract channel statistics and metadata
- Identify content patterns and themes
- Analyze video publishing frequency and consistency
- Determine target audience and niche
- Evaluate visual style and communication approach
- Compare channels within the same niche

**Example Prompts**:

- "Analyze the channel 'TechReviewer'"
- "What are the main topics covered by 'CookingMaster'?"
- "Compare the content strategy of 'GamingPro' and 'GameReviews'"

### 2. Video Idea Generator

**Purpose**: Generate creative and trending video ideas based on channel analysis.

**Core Functions Used**:

- channelVideos
- trendAnalysis
- ideaGeneration

**Capabilities**:

- Create video concepts based on trending topics
- Suggest ideas similar to successful competitor videos
- Generate content series concepts
- Adapt popular formats to specific niches
- Propose seasonal or event-based content

**Example Prompts**:

- "Generate 5 video ideas similar to 'TechReviewer' but for my cooking channel"
- "What are some trending video formats I could adapt for my gaming content?"
- "Suggest a 3-part series based on the most popular videos from 'FitnessCoach'"

### 3. Script Writer

**Purpose**: Create detailed video scripts optimized for engagement.

**Core Functions Used**:

- scriptOutlining
- scriptWriting
- seoOptimization

**Capabilities**:

- Generate full video scripts with hooks, intros, and CTAs
- Adapt writing style to match channel voice
- Create scripts of varying lengths (short-form vs. long-form)
- Incorporate SEO-friendly language
- Structure content for maximum retention

**Example Prompts**:

- "Write a 3-minute script about smartphone photography tips"
- "Create an engaging intro for a video about mechanical keyboards"
- "Generate a script similar to 'CookingMaster' videos but for my recipe"

### 4. Thumbnail Designer (Concept)

**Purpose**: Generate thumbnail concepts and descriptions (not the actual images).

**Core Functions Used**:

- thumbnailConcept
- styleAnalysis

**Capabilities**:

- Describe effective thumbnail layouts
- Suggest text overlays and typography
- Recommend visual elements and composition
- Analyze competitor thumbnails
- Provide color scheme suggestions

**Example Prompts**:

- "Describe a thumbnail concept for my video about budget smartphones"
- "What elements should I include in my cooking tutorial thumbnail?"
- "Analyze the thumbnail style of 'TravelVlogger' and suggest improvements"

### 5. SEO Optimizer

**Purpose**: Optimize video metadata for discoverability.

**Core Functions Used**:

- seoOptimization
- topicExtraction
- trendAnalysis

**Capabilities**:

- Generate SEO-friendly titles
- Create optimized video descriptions
- Suggest relevant tags and keywords
- Analyze competitor metadata
- Recommend best practices for timestamps and links

**Example Prompts**:

- "Generate an SEO-optimized title for my video about home workouts"
- "What tags should I use for my smartphone review video?"
- "Create a description template for my gaming tutorials"

## Creating Custom Agents

Users can create custom agents tailored to specific needs:

1. **Define Purpose**: Clearly state what the agent should specialize in
2. **Select Functions**: Choose which core functions the agent should use
3. **Add Context**: Upload documents or add URLs as reference material
4. **Create System Prompt**: Write a detailed prompt that guides the agent's behavior
5. **Select Model**: Choose the AI model that best fits the agent's purpose
6. **Test and Refine**: Iterate on the agent's configuration based on performance

## Agent Collaboration

Agents can work together to provide comprehensive assistance:

- **Channel Analysis → Video Ideas**: Use channel insights to generate relevant ideas
- **Video Ideas → Script Writing**: Turn concepts into detailed scripts
- **Script Writing → SEO Optimization**: Ensure scripts include key terms and phrases
- **Full Pipeline**: Analyze competitors → Generate ideas → Create scripts → Design thumbnail concepts → Optimize metadata

## Future Agent Types

Planned for future development:

1. **Audience Analyzer**: Focus on understanding viewer demographics and preferences
2. **Trend Spotter**: Identify emerging trends and topics in specific niches
3. **Content Calendar Planner**: Help schedule and organize content releases
4. **Performance Analyst**: Evaluate video metrics and suggest improvements
5. **Collaboration Finder**: Identify potential collaboration partners in similar niches
