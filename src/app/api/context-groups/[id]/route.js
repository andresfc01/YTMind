import { NextResponse } from "next/server";
import { ContextGroupRepository } from "@/lib/db/repositories";

/**
 * GET /api/context-groups/[id]
 * Retrieve a specific context group
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const contextGroup = await ContextGroupRepository.findById(id);

    if (!contextGroup) {
      return NextResponse.json({ error: "Context group not found" }, { status: 404 });
    }

    return NextResponse.json(contextGroup);
  } catch (error) {
    console.error(`Error fetching context group ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch context group", details: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/context-groups/[id]
 * Update a context group
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const contextGroup = await ContextGroupRepository.update(id, data);

    return NextResponse.json(contextGroup);
  } catch (error) {
    console.error(`Error updating context group ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to update context group", details: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/context-groups/[id]
 * Delete a context group
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await ContextGroupRepository.delete(id);

    if (!result) {
      return NextResponse.json({ error: "Context group not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Context group deleted successfully" });
  } catch (error) {
    console.error(`Error deleting context group ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to delete context group", details: error.message }, { status: 500 });
  }
}
