import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  usedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: false,
  },
});

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: false,
  },
  messages: [messageSchema],
  model: {
    type: String,
    default: "gemini-2.0-flash",
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
chatSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  console.log(
    `Guardando chat "${this.title}" en la base de datos ${mongoose.connection.db?.databaseName || "desconocida"}`
  );
  next();
});

// Verificamos si el modelo ya existe para evitar errores de sobredefinición
const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

// Log para depuración
console.log(
  `Modelo Chat inicializado. Base de datos actual: ${mongoose.connection.db?.databaseName || "no conectado aún"}`
);

export default Chat;
