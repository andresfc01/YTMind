import { NextResponse } from "next/server";
import { AgentRepository } from "@/lib/db/repositories";
import { getFunctionByName } from "@/lib/functions";

/**
 * GET /api/agents/[id]/functions
 * Obtiene las funciones asignadas a un agente
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de agente no válido" }, { status: 400 });
    }

    const agent = await AgentRepository.findById(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // Obtener las funciones del agente
    const functions = agent.functions || [];

    // Asegurarnos de que cada función tenga todos sus campos
    const formattedFunctions = functions.map((func) => {
      // Si es un objeto completo, lo usamos directamente
      if (func && typeof func === "object" && func.name) {
        return {
          name: func.name,
          description: func.description || "",
          parameters: func.parameters || {},
        };
      }

      // Si es solo un string, intentamos obtener la definición completa
      if (typeof func === "string") {
        const functionDef = getFunctionByName(func);
        if (functionDef) {
          return {
            name: functionDef.name,
            description: functionDef.description,
            parameters: functionDef.parameters,
          };
        }
        // Si no encontramos la definición, devolvemos al menos el nombre
        return { name: func, description: "", parameters: {} };
      }

      // Caso por defecto
      return { name: "unknown", description: "", parameters: {} };
    });

    return NextResponse.json({ functions: formattedFunctions });
  } catch (error) {
    console.error(`Error al obtener funciones del agente:`, error);
    return NextResponse.json({ error: "Error al obtener funciones del agente" }, { status: 500 });
  }
}

/**
 * POST /api/agents/[id]/functions
 * Asigna una o más funciones a un agente
 */
export async function POST(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de agente no válido" }, { status: 400 });
    }

    const body = await request.json();
    const { functions } = body;

    if (!Array.isArray(functions) || functions.length === 0) {
      console.error("Invalid functions data:", functions);
      return NextResponse.json({ error: "Se requiere un array de nombres de funciones" }, { status: 400 });
    }

    // Verificar que todas las funciones existen
    const invalidFunctions = [];
    const validFunctions = [];

    for (const funcName of functions) {
      const func = getFunctionByName(funcName);
      if (!func) {
        invalidFunctions.push(funcName);
      } else {
        validFunctions.push(funcName); // Enviamos solo el nombre, el repositorio se encargará de obtener los detalles
      }
    }

    if (invalidFunctions.length > 0) {
      console.error("Some functions are invalid:", invalidFunctions);
      return NextResponse.json(
        {
          error: "Algunas funciones no existen",
          invalidFunctions,
        },
        { status: 400 }
      );
    }

    // Actualizar las funciones del agente
    const agent = await AgentRepository.findById(id);

    if (!agent) {
      console.error(`Agent not found: ${id}`);
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // No permitimos actualizar agentes predeterminados
    if (agent.isDefault) {
      console.error(`Cannot modify default agent: ${id}`);
      return NextResponse.json(
        { error: "No se pueden modificar los agentes predeterminados del sistema" },
        { status: 403 }
      );
    }

    // Actualizar las funciones
    const updatedAgent = await AgentRepository.update(id, {
      functions: validFunctions,
    });

    return NextResponse.json({
      message: "Funciones asignadas correctamente",
      agent: {
        id: updatedAgent._id.toString(),
        name: updatedAgent.name,
        functions: updatedAgent.functions,
      },
    });
  } catch (error) {
    console.error(`Error al asignar funciones al agente:`, error);
    return NextResponse.json({ error: `Error al asignar funciones al agente: ${error.message}` }, { status: 500 });
  }
}

/**
 * DELETE /api/agents/[id]/functions
 * Elimina todas las funciones de un agente
 */
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de agente no válido" }, { status: 400 });
    }

    const agent = await AgentRepository.findById(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // No permitimos actualizar agentes predeterminados
    if (agent.isDefault) {
      return NextResponse.json(
        { error: "No se pueden modificar los agentes predeterminados del sistema" },
        { status: 403 }
      );
    }

    // Eliminar todas las funciones
    const updatedAgent = await AgentRepository.update(id, {
      functions: [],
    });

    return NextResponse.json({
      message: "Funciones eliminadas correctamente",
      agent: {
        id: updatedAgent._id.toString(),
        name: updatedAgent.name,
      },
    });
  } catch (error) {
    console.error(`Error al eliminar funciones del agente:`, error);
    return NextResponse.json({ error: "Error al eliminar funciones del agente" }, { status: 500 });
  }
}
