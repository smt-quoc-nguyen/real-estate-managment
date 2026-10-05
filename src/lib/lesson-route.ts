/**
 * Decode a lesson hash without allowing malformed user-controlled URLs to
 * crash application initialization or browser history restoration.
 */
export function readLessonIdFromHash(hash: string): string {
  const encodedLessonId = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!encodedLessonId) return "";

  try {
    return decodeURIComponent(encodedLessonId);
  } catch {
    return "";
  }
}
