import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadImage } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 });
  }

  // Determine upload type (profile, product, or message)
  const uploadType = formData.get("uploadType") ?? "product";
  const file = formData.get("file") ?? formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { message: "No file provided. Use form field 'file' or 'image'." },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Invalid file type. Use JPEG, PNG, WebP or GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { message: "File too large. Maximum size is 5 MB." },
      { status: 400 },
    );
  }

  // Determine folder and access control based on upload type
  let folder = "eena-pins/products";
  if (uploadType === "profile") {
    folder = "eena-pins/profiles";
  } else if (uploadType === "message") {
    folder = "eena-pins/messages";
  } else if (uploadType === "product") {
    // Only BRAND users can upload product images
    if (session.user.role !== "BRAND") {
      return NextResponse.json(
        { message: "Only brands can upload product images" },
        { status: 403 },
      );
    }
  } else {
    return NextResponse.json(
      { message: "Invalid uploadType. Use profile, product, or message." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, {
      folder: folder,
      mimeType: file.type,
    });

    return NextResponse.json({
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ message: message }, { status: 500 });
  }
}
