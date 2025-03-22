"use client";

import React from "react";
import { ContextGroupManager } from "@/components/context-groups";

export default function ContextGroupsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ContextGroupManager />
    </div>
  );
}
