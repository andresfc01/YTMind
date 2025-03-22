import { NextResponse } from "next/server";
import { ChannelRepository } from "@/lib/db/repositories";
import { extractChannelId } from "@/lib/utils/youtube";

/**
 * GET /api/channels
 * List channels with optional filters
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const sortBy = url.searchParams.get("sortBy") || "subscriberCount";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    // Prepare filters
    const filter = {};

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Count total channels for pagination
    const totalCount = await ChannelRepository.count(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Get channels based on filters and options
    const channels = await ChannelRepository.findAll(filter, {
      sort: sortOptions,
      limit,
      skip,
    });

    return NextResponse.json({
      channels,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error listing channels:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/channels
 * Create or fetch a channel from URL
 */
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.url) {
      return NextResponse.json({ error: "Channel URL is required" }, { status: 400 });
    }

    // Extract channel ID from URL
    const channelId = extractChannelId(data.url);

    if (!channelId) {
      return NextResponse.json({ error: "Invalid YouTube channel URL" }, { status: 400 });
    }

    // Check if channel already exists in database
    let channel = await ChannelRepository.findByYouTubeId(channelId);

    // If channel doesn't exist, create it
    if (!channel) {
      channel = await ChannelRepository.createFromYouTubeId(channelId);
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error creating/fetching channel:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
