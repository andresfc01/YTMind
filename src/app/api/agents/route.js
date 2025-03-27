import { NextResponse } from "next/server";
import { AgentRepository } from "@/lib/db/repositories";

/**
 * GET /api/agents
 * Obtener todos los agentes
 */
export async function GET(request) {
  try {
    // Verificamos si hay un parámetro de categoría en la URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let agents;
    if (category) {
      agents = await AgentRepository.findByCategory(category);
    } else {
      agents = await AgentRepository.findAll();
    }

    // Transformamos los datos para la respuesta
    const agentsData = agents.map((agent) => {
      // Crear un objeto plano con todas las propiedades necesarias
      return {
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
    });

    return NextResponse.json({ agents: agentsData });
  } catch (error) {
    console.error("Error al obtener agentes:", error);
    return NextResponse.json({ error: "Error al obtener agentes" }, { status: 500 });
  }
}

/**
 * POST /api/agents
 * Crear un nuevo agente
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, systemPrompt, temperature, model, functions, usesAgents, icon, category } = body;

    // Validaciones básicas
    if (!name || !description || !systemPrompt) {
      return NextResponse.json(
        { error: "Nombre, descripción y prompt del sistema son campos requeridos" },
        { status: 400 }
      );
    }

    // Crear el agente con todos los datos, incluyendo funciones si existen
    const newAgent = await AgentRepository.create({
      name,
      description,
      systemPrompt,
      temperature: temperature || 0.2,
      model: model || "gemini-2.0-flash",
      functions: functions || [], // Permitir funciones directamente
      usesAgents: usesAgents || [],
      icon: icon || "bot",
      category: category || "general",
      isDefault: false, // Los agentes creados por el usuario nunca son predeterminados
    });

    return NextResponse.json(
      {
        agent: {
          id: newAgent._id.toString(),
          name: newAgent.name,
          description: newAgent.description,
          systemPrompt: newAgent.systemPrompt,
          temperature: newAgent.temperature,
          model: newAgent.model,
          functions: newAgent.functions,
          category: newAgent.category,
          icon: newAgent.icon,
          createdAt: newAgent.createdAt,
          updatedAt: newAgent.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear agente:", error);
    return NextResponse.json({ error: "Error al crear agente" }, { status: 500 });
  }
}
