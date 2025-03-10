# YTMind - Asistente IA para Creadores de YouTube

YTMind es una aplicación web que utiliza inteligencia artificial para ayudar a los creadores de contenido en YouTube a optimizar sus canales, generar ideas para videos y crear mejores contenidos.

## Características

- **Análisis de Canales**: Analiza canales de YouTube para extraer insights valiosos
- **Generación de Ideas**: Genera ideas para videos basadas en análisis de competidores
- **Escritura de Guiones**: Crea guiones detallados para diferentes tipos de contenido
- **Optimización SEO**: Sugerencias para thumbnails y optimización de SEO
- **Base de Conocimiento**: Almacena y hace referencia a documentos en las conversaciones
- **Interfaz Tipo Chat**: Interfaz conversacional similar a ChatGPT

## Tecnologías

- **Frontend**: Next.js, TailwindCSS, React
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB
- **IA**: Gemini API
- **Datos**: YouTube Data API

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/yt-mind.git
cd yt-mind
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env.local` con las siguientes variables:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ytmind?retryWrites=true&w=majority

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

El proyecto sigue una estructura organizada basada en funcionalidades:

- `src/app`: Páginas y rutas de la aplicación
- `src/components`: Componentes React reutilizables
- `src/lib`: Utilidades y servicios
- `src/models`: Modelos de datos

## Licencia

Este proyecto está bajo la licencia MIT.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
