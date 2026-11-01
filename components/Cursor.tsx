"use client";

import { useEffect } from "react";
import { initCursor } from "@/lib/engines/cursor";

/** The lime-to-orange dot trail that follows the mouse (skipped on touch and reduced motion). */
export default function Cursor() {
  useEffect(() => initCursor(), []);
  return null;
}
