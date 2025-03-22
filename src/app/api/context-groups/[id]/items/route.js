import { NextResponse } from "next/server";
import { ContextGroupRepository } from "@/lib/db/repositories";
import mongoose from "mongoose";

/**
 * GET /api/context-groups/[id]/items
 * Get all items in a context group with their details
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const items = await ContextGroupRepository.getItemsWithDetails(id);

    return NextResponse.json(items);
  } catch (error) {
    console.error(`Error fetching items from context group ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch items from context group", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/context-groups/[id]/items
 * Add an item to a context group
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate required fields
    if (!data.type || !data.id) {
      return NextResponse.json({ error: "Item type and id are required" }, { status: 400 });
    }

    // Validate type
    const validTypes = ["channel", "video", "document", "url"];
    if (!validTypes.includes(data.type)) {
      return NextResponse.json({ error: `Type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    // Validate that id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.id)) {
      return NextResponse.json({ error: "Invalid item id format" }, { status: 400 });
    }

    // Add the item to the context group
    const contextGroup = await ContextGroupRepository.addItem(id, {
      type: data.type,
      id: data.id,
    });

    return NextResponse.json(contextGroup);
  } catch (error) {
    console.error(`Error adding item to context group ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to add item to context group", details: error.message }, { status: 500 });
  }
}
