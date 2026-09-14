import type { CreateTripInput, Trip } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/trips/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw new ApiError(
      "Cannot reach the trip-planning server. Make sure the Django API is running.",
      error,
    );
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = getErrorMessage(body) ?? "The trip could not be planned.";
    throw new ApiError(message, body);
  }

  return body as Trip;
}

function getErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;

  const details = body as Record<string, unknown>;
  if (typeof details.detail === "string") return details.detail;

  for (const value of Object.values(details)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }

  return null;
}
