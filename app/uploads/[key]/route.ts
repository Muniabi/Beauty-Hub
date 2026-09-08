import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(path.join(process.cwd(), "uploads", key));
    const ext = key.split(".").pop();
    const type =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return new Response(file, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
