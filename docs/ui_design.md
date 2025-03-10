# YTMind UI/UX Design

## Design Principles

YTMind follows a clean, minimalist design approach similar to ChatGPT, with a focus on:

1. **Simplicity**: Clean interfaces with minimal distractions
2. **Dark Mode**: Dark theme for reduced eye strain during extended use
3. **Conversational UI**: Chat-centric interface for natural interaction
4. **Contextual Information**: Relevant data displayed when needed
5. **Responsive Design**: Works well on desktop and tablet devices

## Color Palette

```
Primary Background: #0f0f0f (Very Dark Gray)
Secondary Background: #1f1f1f (Dark Gray)
Accent: #8e44ad (Purple)
Text Primary: #ffffff (White)
Text Secondary: #a0a0a0 (Light Gray)
User Message: #2d3748 (Dark Blue-Gray)
Assistant Message: #1a202c (Very Dark Blue-Gray)
Success: #48bb78 (Green)
Error: #f56565 (Red)
Warning: #ed8936 (Orange)
```

## Typography

```
Primary Font: Inter, sans-serif
Monospace Font: JetBrains Mono, monospace (for code blocks)
Base Font Size: 16px
Line Height: 1.5
```

## Layout Components

### Main Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Header                                                          │
├───────────────┬─────────────────────────────────────────────────┤
│               │                                                 │
│               │                                                 │
│               │                                                 │
│               │                                                 │
│    Sidebar    │                 Main Content                    │
│               │                                                 │
│               │                                                 │
│               │                                                 │
│               │                                                 │
├───────────────┴─────────────────────────────────────────────────┤
│ Footer (optional)                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Header

- Logo and app name
- Model selection dropdown
- User settings (if needed)

### Sidebar

- New chat button
- Chat history list
- Agent selection
- Analyzed channels list
- Saved documents list
- Collapse/expand toggle

### Main Content Area

- Chat messages container
- Message input area
- Typing indicator
- Context panel (when needed)

## Key Components

### Chat Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ Chat Title                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ User Message                                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Assistant Message                                       │    │
│  │                                                         │    │
│  │ [Optional: Embedded content, like channel analysis]     │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ User Message                                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Message Input                                    [Send] │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Selection

```
┌─────────────────────────────────────────────────────────────────┐
│ Select Agent                                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Channel Analyst                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Video Idea Generator                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Script Writer                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ + Create New Agent                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Channel Analysis Display

```
┌─────────────────────────────────────────────────────────────────┐
│ Channel: TechReviewer                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Channel Stats                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │ 250 Videos  │ │ Since 2018  │ │ 2 videos/wk │ │ Tech Niche│  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
│                                                                 │
│  Main Topics                                                    │
│  ┌─────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ Phones  │ │ Laptops      │ │ Headphones │ │ Smart Home   │  │
│  └─────────┘ └──────────────┘ └────────────┘ └──────────────┘  │
│                                                                 │
│  Top Videos                                                     │
│  1. iPhone 15 Pro Review - 1.2M views                           │
│  2. Best Budget Laptops 2023 - 980K views                       │
│  3. AirPods Pro 2 vs Sony XM5 - 750K views                      │
│                                                                 │
│  Content Style                                                  │
│  - In-depth reviews (10-15 minutes)                             │
│  - Comparison videos                                            │
│  - Minimal editing, focus on information                        │
│  - Direct, authoritative communication style                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Create Agent Form

```
┌─────────────────────────────────────────────────────────────────┐
│ Create New Agent                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agent Name                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [Input field]                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Description                                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [Input field]                                           │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  System Prompt                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [Textarea]                                              │    │
│  │                                                         │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Model                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Gemini 2.0 Flash                                     ▼  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │   Cancel    │  │    Create   │                               │
│  └─────────────┘  └─────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Responsive Design

The interface will adapt to different screen sizes:

### Desktop (1200px+)

- Full sidebar visible
- Spacious layout
- Multi-column where appropriate

### Tablet (768px - 1199px)

- Collapsible sidebar
- Slightly condensed layout
- Single column for most content

### Mobile (< 768px)

- Hidden sidebar (accessible via menu)
- Compact layout
- Optimized for vertical scrolling

## Interaction Patterns

### Chat Interaction

1. User types message in input field
2. Message appears in chat with "sending" indicator
3. Assistant responds with typing indicator
4. Response appears in chunks for longer messages
5. Code blocks and structured data have special formatting

### Agent Selection

1. User clicks agent in sidebar
2. Agent details appear in main content area
3. User can start chat with selected agent
4. Current agent is highlighted in sidebar

### Channel Analysis

1. User requests channel analysis in chat
2. Loading indicator appears during analysis
3. Results appear in structured format
4. User can click to expand sections for more details
5. Analysis is saved and accessible from sidebar

## Accessibility Considerations

- High contrast between text and background
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators for interactive elements
- Alternative text for visual elements
- Resizable text support

## Loading States

- Chat messages: Typing indicator
- Channel analysis: Progress bar or spinner
- Agent creation: Button loading state
- Initial load: Skeleton screens

## Error States

- Network errors: Retry option
- API limits: Clear explanation and waiting period
- Invalid inputs: Inline validation messages
- Missing data: Fallback content and explanation
