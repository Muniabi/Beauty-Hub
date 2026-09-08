import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { requireSessionUser } from "@/lib/auth/current-user";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const user = await requireSessionUser().catch(() => null);
  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: { code: "VALIDATION" } }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: { code: "VALIDATION" } }, { status: 400 });
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return Response.json({ error: { code: "VALIDATION" } }, { status: 400 });
  }

  const key = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), Buffer.from(await file.arrayBuffer()));
  return Response.json({ objectKey: key });
}
