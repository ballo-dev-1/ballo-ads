import path from "path";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { requireMtnReviewSession } from "@/lib/mtnReviewAuth";

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const PUBLIC_ATTACHMENTS_DIR = path.join(process.cwd(), "public", "mtn-review-attachments");

function safeExtension(fileName: string): string {
  const ext = path.extname(fileName || "").toLowerCase();
  if (!ext || ext.length > 10) return "";
  return ext.replace(/[^a-z0-9.]/g, "");
}

export async function POST(request: Request) {
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });
  }

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files were provided." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can upload up to ${MAX_FILES} files at once.` },
      { status: 400 },
    );
  }

  await mkdir(PUBLIC_ATTACHMENTS_DIR, { recursive: true });
  const uploaded: Array<{ url: string; name: string; size: number; contentType: string }> = [];

  for (const file of files) {
    if (file.size <= 0) {
      return NextResponse.json(
        { error: `File "${file.name}" is empty.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds 10 MB.` },
        { status: 400 },
      );
    }

    const ext = safeExtension(file.name);
    const storedName = `${Date.now()}-${randomUUID()}${ext}`;
    const outputPath = path.join(PUBLIC_ATTACHMENTS_DIR, storedName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(outputPath, bytes);

    uploaded.push({
      url: `/mtn-review-attachments/${storedName}`,
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    });
  }

  return NextResponse.json({ files: uploaded });
}
