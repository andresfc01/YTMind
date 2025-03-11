import { NextResponse } from "next/server";
import { getAllFunctions } from "@/lib/functions";

/**
 * GET /api/functions
 * Obtiene todas las funciones disponibles para los agentes
 */
export async function GET() {
  try {
    const allFunctions = getAllFunctions();

    const functions = allFunctions.map((func) => ({
      name: func.name,
      description: func.description,
      parameters: func.parameters,
    }));

    return NextResponse.json({ functions });
  } catch (error) {
    console.error("Error al obtener las funciones:", error);
    return NextResponse.json({ error: "Error al obtener las funciones disponibles" }, { status: 500 });
  }
}
