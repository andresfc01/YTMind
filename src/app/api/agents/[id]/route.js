import { NextResponse } from "next/server";
import { AgentRepository } from "@/lib/db/repositories";

/**
 * GET /api/agents/[id]
 * Obtener un agente específico
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

    console.log(`GET agente ${id}: ${agent.name}`);
    console.log(`El agente tiene ${agent.functions?.length || 0} funciones:`, agent.functions);

    // Transformamos para la respuesta - creando un objeto plano con todas las propiedades
    const agentData = {
      id: agent._id.toString(),
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature,
      model: agent.model,
      functions: agent.functions || [],
      usesAgents: agent.usesAgents || [],
      icon: agent.icon,
      category: agent.category,
      isDefault: agent.isDefault,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };

    return NextResponse.json({ agent: agentData });
  } catch (error) {
    console.error(`Error al obtener agente:`, error);
    return NextResponse.json({ error: "Error al obtener agente" }, { status: 500 });
  }
}

/**
 * PUT /api/agents/[id]
 * Actualizar un agente existente
 */
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de agente no válido" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, systemPrompt, temperature, model, functions, usesAgents, icon, category } = body;
    console.log("Received PUT request with temperature:", temperature, typeof temperature);
    console.log("Received functions:", functions);

    // Validaciones básicas
    if (!name || !description || !systemPrompt) {
      return NextResponse.json(
        { error: "Nombre, descripción y prompt del sistema son campos requeridos" },
        { status: 400 }
      );
    }

    // No permitimos actualizar agentes predeterminados
    const existingAgent = await AgentRepository.findById(id);
    if (existingAgent.isDefault) {
      return NextResponse.json(
        { error: "No se pueden modificar los agentes predeterminados del sistema" },
        { status: 403 }
      );
    }

    // Asegurarnos de que temperature sea un número válido
    const temperatureValue = parseFloat(temperature);
    if (isNaN(temperatureValue) || temperatureValue < 0 || temperatureValue > 2) {
      return NextResponse.json({ error: "El valor de temperature debe ser un número entre 0 y 2" }, { status: 400 });
    }

    try {
      // Actualizamos todos los campos, incluyendo las funciones
      const updatedAgent = await AgentRepository.update(id, {
        name,
        description,
        systemPrompt,
        temperature: temperatureValue,
        model,
        functions, // Incluir las funciones directamente
        usesAgents,
        icon,
        category,
      });

      console.log(`Agente ${id} actualizado con ${updatedAgent.functions?.length || 0} funciones`);

      // Asegurarnos de que todos los campos necesarios estén en la respuesta
      const responseData = {
        agent: {
          id: updatedAgent._id.toString(),
          name: updatedAgent.name,
          description: updatedAgent.description,
          systemPrompt: updatedAgent.systemPrompt,
          temperature: updatedAgent.temperature || 0.7, // Asegurar un valor por defecto
          model: updatedAgent.model,
          functions: updatedAgent.functions,
          usesAgents: updatedAgent.usesAgents,
          category: updatedAgent.category,
          icon: updatedAgent.icon,
          isDefault: updatedAgent.isDefault,
          createdAt: updatedAgent.createdAt,
          updatedAt: updatedAgent.updatedAt,
        },
      };

      return NextResponse.json(responseData);
    } catch (updateError) {
      console.error("Error updating agent:", updateError);
      return NextResponse.json({ error: `Error al actualizar el agente: ${updateError.message}` }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error al actualizar agente:`, error);
    return NextResponse.json({ error: "Error al actualizar agente" }, { status: error.status || 500 });
  }
}

/**
 * DELETE /api/agents/[id]
 * Eliminar un agente
 */
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de agente no válido" }, { status: 400 });
    }

    // No permitimos eliminar agentes predeterminados
    const existingAgent = await AgentRepository.findById(id);
    if (existingAgent.isDefault) {
      return NextResponse.json(
        { error: "No se pueden eliminar los agentes predeterminados del sistema" },
        { status: 403 }
      );
    }

    await AgentRepository.delete(id);

    return NextResponse.json({ success: true, message: `Agente con ID ${id} eliminado` });
  } catch (error) {
    console.error(`Error al eliminar agente:`, error);
    return NextResponse.json({ error: "Error al eliminar agente" }, { status: 500 });
  }
}
