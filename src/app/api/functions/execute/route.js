import { NextResponse } from "next/server";
import { executeFunction, getFunctionByName } from "@/lib/functions";

/**
 * POST /api/functions/execute
 * Ejecuta una función específica con los parámetros proporcionados
 */
export async function POST(request) {
  try {
    // Extraer datos del cuerpo de la solicitud
    const body = await request.json();
    const { functionName, parameters = {} } = body;

    // Validar que se proporciona un nombre de función
    if (!functionName) {
      return NextResponse.json({ error: "Se requiere el nombre de la función" }, { status: 400 });
    }

    // Verificar que la función existe
    const functionDef = getFunctionByName(functionName);
    if (!functionDef) {
      return NextResponse.json({ error: `Función "${functionName}" no encontrada` }, { status: 404 });
    }

    // Ejecutar la función
    try {
      const result = await executeFunction(functionName, parameters);

      return NextResponse.json({
        success: true,
        function: functionName,
        result,
      });
    } catch (execError) {
      console.error(`Error al ejecutar la función "${functionName}":`, execError);
      return NextResponse.json(
        {
          error: `Error al ejecutar la función: ${execError.message}`,
          function: functionName,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en el endpoint de ejecución de funciones:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}

/**
 * GET /api/functions/execute
 * Endpoint informativo - no está permitido
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Método no permitido. Use POST para ejecutar funciones",
      usage: "POST /api/functions/execute con { functionName, parameters }",
    },
    { status: 405 }
  );
}
