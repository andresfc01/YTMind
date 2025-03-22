import { NextResponse } from "next/server";
import { UrlRepository } from "@/lib/db/repositories";
import mongoose from "mongoose";

/**
 * GET /api/urls
 * Get all URLs
 */
export async function GET(request) {
  try {
    const urls = await UrlRepository.findAll();
    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return NextResponse.json({ error: "Failed to fetch URLs", details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/urls
 * Create or fetch a URL
 */
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(data.url); // This will throw if invalid
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Check if URL already exists in database
    let url = await UrlRepository.findByUrl(data.url);

    // If URL doesn't exist, create it
    if (!url) {
      url = await UrlRepository.create({
        url: data.url,
        title: data.title || "",
        description: data.description || "",
        metadata: data.metadata || {},
      });
    }

    return NextResponse.json(url);
  } catch (error) {
    console.error("Error creating/fetching URL:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
