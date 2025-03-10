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

console.log("Intentando conectar a MongoDB con URI:", uri.replace(/:[^\/]+@/, ":****@")); // Ocultar la contraseña
console.log("Base de datos seleccionada:", DB_NAME);

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
    console.log("Usando conexión en caché a MongoDB");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME, // Especificar explícitamente el nombre de la base de datos
    };

    console.log("Estableciendo nueva conexión a MongoDB");
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log(`Conectado a MongoDB. Base de datos: ${mongoose.connection.db.databaseName}`);
      console.log(
        `Colecciones disponibles: ${Object.keys(mongoose.connection.collections).join(", ") || "ninguna todavía"}`
      );
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
    console.log("Bases de datos disponibles:", result.databases.map((db) => db.name).join(", "));
    console.log("Base de datos actual:", conn.connection.db.databaseName);
    return result.databases;
  } catch (error) {
    console.error("Error al listar bases de datos:", error);
    return [];
  }
}

export default connectToDatabase;
