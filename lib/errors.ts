/**
 * Extracts a readable message from an unknown error.
 *
 * In `catch` blocks the value is `unknown`; centralizing it here avoids
 * repeating `error: any` and `error.message` across every screen.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  return fallback;
}
