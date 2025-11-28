/**
 * String and text formatting utilities
 */

/**
 * Truncates a string to a maximum length with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || typeof str !== "string") return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength).trim() + "...";
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Formats a time duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(" ") || "0s";
}

/**
 * Cleans up whitespace in text
 */
export function cleanWhitespace(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text.trim().replaceAll(/\s+/g, " ");
}

/**
 * Sanitizes text by removing special characters (basic)
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text.replaceAll(/[<>]/g, "");
}

/**
 * Splits text into paragraphs
 */
export function splitParagraphs(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  return text
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Gets initials from a name
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
