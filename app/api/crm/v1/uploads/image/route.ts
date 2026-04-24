import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmRole } from "@/lib/crmServer";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function POST(request: Request) {
  return withCrmRole(["editor", "admin"], async () => {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return crmError("Bad request", 400, "No file uploaded");
    if (file.size > MAX_SIZE) return crmError("Bad request", 400, "File too large");
    if (!ALLOWED_TYPES.has(file.type)) return crmError("Bad request", 400, "Unsupported file type");

    const ext = file.name.split(".").pop() || "bin";
    const folder = String(form.get("folder") || "popup-images");
    const key = `${folder}/${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "crm-uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, `${key.split("/").pop()}`);
    await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));
    return crmOk({ url: `/crm-uploads/${key}`, key, size: file.size });
  });
}
