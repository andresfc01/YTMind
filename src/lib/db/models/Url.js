import mongoose from "mongoose";

// Primero intentamos eliminar el modelo existente para forzar su recreación
try {
  // Esto es necesario solo si hay problemas con la actualización del esquema
  if (mongoose.models.Url) {
    delete mongoose.models.Url;
  }
} catch (error) {
  console.log("No fue necesario eliminar el modelo Url anterior");
}

const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
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
urlSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  console.log(
    `Guardando URL "${this.url}" para el agente ${this.agentId} en la base de datos ${
      mongoose.connection.db?.databaseName || "desconocida"
    }`
  );
  next();
});

// Verificamos si el modelo ya existe para evitar errores de sobredefinición
const Url = mongoose.models.Url || mongoose.model("Url", urlSchema);

// Log para depuración
console.log(
  `Modelo Url inicializado. Base de datos actual: ${mongoose.connection.db?.databaseName || "no conectado aún"}`
);

export default Url;
