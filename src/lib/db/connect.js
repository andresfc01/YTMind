import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
// Definir explícitamente el nombre de la base de datos
const DB_NAME = "ytmind-db";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Construir la URI con el enfoque recomendado por MongoDB
// Primero, obtener la URI base sin la parte de la base de datos
let baseUri = MONGODB_URI.trim();
// Eliminar cualquier barra adicional al final de la URI base
baseUri = baseUri.replace(/\/$/, "");
// Eliminar cualquier base de datos existente en la URI
baseUri = baseUri.split("/").slice(0, 3).join("/");

// Extraer la parte de la URI antes de los parámetros de consulta
let queryParams = "";
if (baseUri.includes("?")) {
  const parts = baseUri.split("?");
  baseUri = parts[0];
  queryParams = "?" + parts[1];
}

// Construir la URI final con la base de datos especificada
const uri = `${baseUri}/${DB_NAME}${queryParams}`;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME, // Especificar explícitamente el nombre de la base de datos
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("Error al conectar a MongoDB:", e);
    throw e;
  }

  return cached.conn;
}

// Función para listar todas las bases de datos disponibles
export async function listDatabases() {
  try {
    const conn = await connectToDatabase();
    const admin = conn.connection.db.admin();
    const result = await admin.listDatabases();
    return result.databases;
  } catch (error) {
    console.error("Error al listar bases de datos:", error);
    return [];
  }
}

export default connectToDatabase;
