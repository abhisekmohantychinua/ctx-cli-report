export async function loadContext(): Promise<unknown> {
  const response = await fetch("/ctx.json");

  if (!response.ok) {
    throw new Error(`Failed to load ctx.json: ${response.status}`);
  }

  return response.json();
}
