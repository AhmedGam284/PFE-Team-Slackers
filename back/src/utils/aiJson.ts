import { z } from "zod";

export type SafeParseResult<T> =
  | { ok: true; value: T; usedFallback: false }
  | { ok: true; value: T; usedFallback: true; error: string }
  | { ok: false; error: string };

const extractFirstJsonObject = (text: string): string | null => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return text.slice(firstBrace, lastBrace + 1);
};

export const safeJsonParse = (text: string): unknown | null => {
  try {
    return JSON.parse(text);
  } catch {
    const extracted = extractFirstJsonObject(text);
    if (!extracted) return null;
    try {
      return JSON.parse(extracted);
    } catch {
      return null;
    }
  }
};

export const parseAndValidateOrFallback = <T>(params: {
  rawText: string;
  schema: z.ZodSchema<T>;
  fallback: () => T;
}): SafeParseResult<T> => {
  const parsed = safeJsonParse(params.rawText);
  if (parsed == null) {
    return {
      ok: true,
      value: params.fallback(),
      usedFallback: true,
      error: "Could not parse JSON from model output",
    };
  }

  const validated = params.schema.safeParse(parsed);
  if (!validated.success) {
    return {
      ok: true,
      value: params.fallback(),
      usedFallback: true,
      error: "Model JSON did not match expected schema",
    };
  }

  return { ok: true, value: validated.data, usedFallback: false };
};
