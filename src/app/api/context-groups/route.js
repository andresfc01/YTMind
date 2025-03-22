import { NextResponse } from "next/server";
import { ContextGroupRepository } from "@/lib/db/repositories";

/**
 * GET /api/context-groups
 * Retrieve all context groups
 */
export async function GET() {
  try {
    const contextGroups = await ContextGroupRepository.findAll();
    return NextResponse.json(contextGroups);
  } catch (error) {
    console.error("Error fetching context groups:", error);
    return NextResponse.json({ error: "Failed to fetch context groups", details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/context-groups
 * Create a new context group
 */
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Context group name is required" }, { status: 400 });
    }

    const contextGroup = await ContextGroupRepository.create(data);
    return NextResponse.json(contextGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating context group:", error);
    return NextResponse.json({ error: "Failed to create context group", details: error.message }, { status: 500 });
  }
}
