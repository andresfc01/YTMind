import mongoose from "mongoose";

/**
 * Schema para las funciones que un agente puede realizar
 */
const functionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  parameters: {
    type: Object, // JSON Schema para los parámetros de la función
    required: true,
  },
});

/**
 * Schema para los agentes que un agente puede utilizar
 */
const usedAgentSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
});

/**
 * Schema principal para los agentes
 */
const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 2,
  },
  model: {
    type: String,
    default: "gemini-2.0-flash",
  },
  functions: [functionSchema],
  usesAgents: [usedAgentSchema],
  icon: {
    type: String,
    default: "bot", // Valor por defecto para el icono
  },
  category: {
    type: String,
    enum: ["analysis", "content", "seo", "general"],
    default: "general",
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar la fecha 'updatedAt' en cada actualización
agentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  console.log(
    `Guardando agente "${this.name}" en la base de datos ${mongoose.connection.db?.databaseName || "desconocida"}`
  );

  // Verificar las funciones
  if (this.functions && this.functions.length > 0) {
    console.log(`El agente "${this.name}" tiene ${this.functions.length} funciones asignadas`);
    this.functions.forEach((func, index) => {
      console.log(`Función ${index + 1}:`, func);

      // Verificar que cada función tenga los campos requeridos
      if (!func.name || !func.description || !func.parameters) {
        console.warn(`Advertencia: La función ${index + 1} puede no tener todos los campos requeridos:`, func);
      }
    });
  } else {
    console.log(`El agente "${this.name}" no tiene funciones asignadas`);
  }

  next();
});

// Verificamos si el modelo ya existe para evitar errores de sobredefinición
const Agent = mongoose.models.Agent || mongoose.model("Agent", agentSchema);

// Log para depuración
console.log(
  `Modelo Agent inicializado. Base de datos actual: ${mongoose.connection.db?.databaseName || "no conectado aún"}`
);

export default Agent;
