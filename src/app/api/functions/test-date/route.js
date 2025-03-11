import { NextResponse } from "next/server";
import { getCurrentDate } from "@/lib/functions/dateUtils";

/**
 * GET /api/functions/test-date
 * Endpoint de prueba para la función getCurrentDate
 */
export async function GET(request) {
  try {
    // Obtener formato de los query params si existe
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "medium";

    // Validar el formato
    if (!["short", "medium", "long"].includes(format)) {
      return NextResponse.json({ error: "Formato no válido. Usar 'short', 'medium' o 'long'" }, { status: 400 });
    }

    // Ejecutar la función
    const result = getCurrentDate({ format });

    return NextResponse.json({
      message: "Fecha actual obtenida correctamente",
      result,
    });
  } catch (error) {
    console.error("Error al probar la función getCurrentDate:", error);
    return NextResponse.json({ error: "Error al obtener la fecha actual" }, { status: 500 });
  }
}
