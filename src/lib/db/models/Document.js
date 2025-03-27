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
  const dbName = mongoose.connection.db?.databaseName || "desconocida";

  // Handle optional agentId
  const agentInfo = this.agentId ? `para el agente ${this.agentId}` : "sin agente asignado";

  console.log(`Guardando documento "${this.name}" ${agentInfo} en la base de datos ${dbName}`);
  next();
});

// Verificamos si el modelo ya existe para evitar errores de sobredefinición
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;
