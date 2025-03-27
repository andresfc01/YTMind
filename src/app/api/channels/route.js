import { NextResponse } from "next/server";
import { ChannelRepository } from "@/lib/db/repositories";
import { extractChannelId, isChannelUsername } from "@/lib/utils/youtube";
import { getChannelInfo } from "@/lib/functions/youtubeAnalysis";

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

    // Extract channel ID or username from URL
    const channelIdentifier = extractChannelId(data.url);

    if (!channelIdentifier) {
      return NextResponse.json({ error: "Invalid YouTube channel URL" }, { status: 400 });
    }

    // First try to find the channel in our database
    let dbChannel;
    try {
      // If it's a channel ID (UC...), search directly
      if (channelIdentifier.startsWith("UC")) {
        dbChannel = await ChannelRepository.findByChannelId(channelIdentifier);
      } else {
        // For usernames, we need to check if we have stored the channel before
        // by finding any channel that might contain this username in metadata.customUrl
        const channels = await ChannelRepository.findAll({
          "metadata.customUrl": { $regex: channelIdentifier.replace(/^@|^c\/|^user\//, "") },
        });
        if (channels && channels.length > 0) {
          dbChannel = channels[0];
        }
      }
    } catch (err) {
      console.log("Channel not found in DB, will create a new one", err.message);
    }

    // If channel exists in our database, return it
    if (dbChannel) {
      console.log("Channel found in database, returning:", dbChannel.name);
      return NextResponse.json(dbChannel);
    }

    // Channel not in DB, fetch from YouTube API
    console.log("Fetching channel info from YouTube API for:", channelIdentifier);
    const channelInfo = await getChannelInfo({
      channelIdentifier: channelIdentifier,
      fetchPopularVideos: true,
    });

    // Create a database record with the info from YouTube API
    // Ensure we always have the required fields
    const channelData = {
      channelId: channelInfo.channelId,
      name: channelInfo.name || `YouTube Channel (${channelIdentifier})`,
      description: channelInfo.description || "",
      statistics: channelInfo.statistics || {},
      metadata: channelInfo.metadata || {},
      analyzedAt: new Date(),
    };

    // Create the channel record in our database
    try {
      dbChannel = await ChannelRepository.create(channelData);
      console.log("Created new channel in database:", dbChannel.name);
    } catch (error) {
      console.error("Error creating channel:", error);
      return NextResponse.json(
        {
          error: `Failed to create channel: ${error.message}`,
          details: channelData,
        },
        { status: 500 }
      );
    }

    // Return the database document which has the _id field
    return NextResponse.json(dbChannel);
  } catch (error) {
    console.error("Error processing channel:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
