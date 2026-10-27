/**
 * Generates a random email address for dynamic test execution
 */
export function generateRandomEmail(prefix: string = 'user'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}@example.com`;
}

/**
 * Standard delay utility when explicit wait state is not sufficient
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
