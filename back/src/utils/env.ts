import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.coerce.number().int().positive().optional().default(5000),
  CORS_ORIGINS: z
    .string()
    .optional()
    .default(
      [
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:5173",
      ].join(",")
    ),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional().default("gemini-1.5-flash"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional().default("gpt-4.1-mini"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast on invalid env, but keep error readable.
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
