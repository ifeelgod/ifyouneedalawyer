import { NextResponse } from "next/server";

export async function GET() {
  const envKeys = Object.keys(process.env).filter(
    (k) =>
      k.includes("DATA") ||
      k.includes("POSTGRES") ||
      k.includes("PRISMA") ||
      k.includes("URL") ||
      k.includes("STORAGE")
  );

  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlPrefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.split("://")[0] + "://"
      : "MISSING",
    relatedEnvVariables: envKeys,
  });
}
