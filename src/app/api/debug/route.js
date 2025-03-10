import { NextResponse } from "next/server";
import connectToDatabase, { listDatabases } from "@/lib/db/connect";
import mongoose from "mongoose";

/**
 * GET /api/debug
 * Endpoint para depurar la conexión a MongoDB
 */
export async function GET() {
  try {
    // Conectar a la base de datos
    await connectToDatabase();

    // Listar bases de datos
    const databases = await listDatabases();

    // Obtener información de la conexión actual
    const connectionInfo = {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      dbName: mongoose.connection.db.databaseName,
      collections: Object.keys(mongoose.connection.collections),
      models: Object.keys(mongoose.models),
      connectionState: mongoose.connection.readyState === 1 ? "Conectado" : "Desconectado",
    };

    // Verificar si hay documentos en la colección Chat
    let chatCount = 0;
    try {
      if (mongoose.models.Chat) {
        chatCount = await mongoose.models.Chat.countDocuments();
        console.log(`Número de chats encontrados: ${chatCount}`);
      }
    } catch (e) {
      console.error("Error al contar documentos en Chat:", e);
    }

    return NextResponse.json({
      message: "Información de depuración de MongoDB",
      databases: databases.map((db) => ({
        name: db.name,
        sizeOnDisk: Math.round((db.sizeOnDisk / 1024 / 1024) * 100) / 100 + " MB",
        empty: db.empty,
      })),
      connection: connectionInfo,
      chatCount,
      uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:[^\/]+@/, ":****@") : "No disponible",
    });
  } catch (error) {
    console.error("Error al depurar conexión MongoDB:", error);
    return NextResponse.json({ error: "Error al depurar conexión MongoDB", details: error.message }, { status: 500 });
  }
}
