import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["text", "markdown", "pdf", "json"],
    default: "text",
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
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
documentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  console.log(
    `Guardando documento "${this.name}" para el agente ${this.agentId} en la base de datos ${
      mongoose.connection.db?.databaseName || "desconocida"
    }`
  );
  next();
});

// Verificamos si el modelo ya existe para evitar errores de sobredefinición
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

// Log para depuración
console.log(
  `Modelo Document inicializado. Base de datos actual: ${mongoose.connection.db?.databaseName || "no conectado aún"}`
);

export default Document;
