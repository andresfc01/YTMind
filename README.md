# YTMind

YTMind is a personal web platform that serves as a specialized YouTube assistant, combining competitor analysis with AI-powered content generation. The system is built around an intelligent chat interface that allows users to analyze specific YouTube channels on demand and generate content ideas based on that analysis.

## Features

- **YouTube Channel Analysis**: Extract key information from specified YouTube channels
- **Knowledge Base System**: Store and reference analyzed channels in conversations
- **Content Generation**: Generate video ideas, scripts, titles, and thumbnail concepts
- **Specialized Agents**: Create different AI agents for specific tasks
- **Dark Mode UI**: Clean, minimalist interface similar to ChatGPT

## Tech Stack

- **Frontend**: Next.js with JavaScript and TailwindCSS
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **AI Model**: Gemini 2.0 Flash (with option to switch models)

## Project Structure

```
YTMind/
├── docs/                  # Project documentation
│   ├── project_overview.md
│   ├── technical_architecture.md
│   ├── specialized_agents.md
│   ├── implementation_roadmap.md
│   └── ui_design.md
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Utility functions and services
│   ├── models/            # Data models
│   └── styles/            # Global styles
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── next.config.js         # Next.js configuration
├── package.json           # Project dependencies
├── README.md              # Project overview
└── tailwind.config.js     # TailwindCSS configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- YouTube Data API key
- Gemini API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ytmind.git
   cd ytmind
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:

   ```
   MONGODB_URI=your_mongodb_connection_string
   YOUTUBE_API_KEY=your_youtube_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Project Overview](docs/project_overview.md)
- [Technical Architecture](docs/technical_architecture.md)
- [Specialized Agents](docs/specialized_agents.md)
- [Implementation Roadmap](docs/implementation_roadmap.md)
- [UI Design](docs/ui_design.md)

## License

This project is for personal use only.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Google Gemini](https://ai.google.dev/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
