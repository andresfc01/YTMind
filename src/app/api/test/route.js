import { NextResponse } from "next/server";
import { executeFunction } from "@/lib/functions";

/**
 * Endpoint para probar funciones de la API directamente
 */
export async function POST(request) {
  try {
    const { functionName, params } = await request.json();

    if (!functionName) {
      return NextResponse.json({ error: "Se requiere el nombre de la función" }, { status: 400 });
    }

    console.log(`Test API: Ejecutando función ${functionName} con parámetros:`, params);

    // Ejecutar la función solicitada
    const result = await executeFunction(functionName, params || {});

    return NextResponse.json({
      success: true,
      functionName,
      result,
    });
  } catch (error) {
    console.error("Error en test API:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
