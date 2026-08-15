import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkPermissionForApiRoute } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/security/permissions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  // Only staff with product-edit permission can upload images — this
  // endpoint writes to storage and costs money per upload, so it must
  // never be reachable by an unauthenticated or non-admin request.
  const authCheck = await checkPermissionForApiRoute(PERMISSIONS.PRODUCTS_EDIT);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Image upload isn't set up yet. In your Vercel project, go to Storage → Create Database → Blob, then redeploy. Until then, use the image URL field instead.",
      },
      { status: 501 }
    );
  }

  let file: FormDataEntryValue | null;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch (err) {
    console.error("Upload: failed to parse form data:", err);
    return NextResponse.json({ error: "Could not read the uploaded file. Please try again." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Only JPG, PNG, WEBP, or GIF images are allowed (got "${file.type || "unknown type"}")` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  try {
    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    // Logged server-side so the real cause (e.g. an invalid/expired
    // BLOB_READ_WRITE_TOKEN) is visible in Vercel's function logs, even
    // though the client only sees a generic message.
    console.error("Image upload to Blob storage failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Upload failed: ${message}. Check that Blob storage is connected in your Vercel project.` },
      { status: 500 }
    );
  }
}
