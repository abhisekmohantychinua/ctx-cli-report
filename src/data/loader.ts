import { SourceDataSchema } from "./schemas/source-data-schema";
import type { SourceData } from "./models/source-data";

/**
 * Loads and parses the raw CTX report payload from the public runtime asset.
 *
 * <p>The fetched JSON is parsed through {@link SourceDataSchema}, which
 * validates the report structure and converts serialized temporal values into
 * their corresponding Luxon runtime types.
 *
 * @returns The parsed CTX report data used by the data pipeline.
 * @throws {Error} If the report asset cannot be fetched successfully.
 * @throws {ZodError} If the fetched payload does not conform to the CTX report
 *                    contract.
 */
export async function loadContext(): Promise<SourceData> {
  const contextPath = import.meta.env.BASE_URL + "ctx.json";
  const response = await fetch(contextPath);

  if (!response.ok) {
    throw new Error(
      `Failed to load ctx.json: ${response.status} ${response.statusText}`,
    );
  }

  const payload: unknown = await response.json();

  return SourceDataSchema.parse(payload);
}
