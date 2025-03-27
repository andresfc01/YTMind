import { NextResponse } from "next/server";
import { ContextGroupRepository } from "@/lib/db/repositories";

/**
 * DELETE /api/context-groups/[id]/items/[itemId]
 * Remove an item from a context group
 */
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const itemId = params.itemId;

    const contextGroup = await ContextGroupRepository.removeItem(id, itemId);

    return NextResponse.json(contextGroup);
  } catch (error) {
    console.error(`Error removing item from context group:`, error);
    return NextResponse.json(
      { error: "Failed to remove item from context group", details: error.message },
      { status: 500 }
    );
  }
}
