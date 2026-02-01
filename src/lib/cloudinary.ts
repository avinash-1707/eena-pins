import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
}

export type UploadResult = {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
};

/**
 * Upload an image to Cloudinary from a buffer (e.g. from multipart form).
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in env.
 */
export async function uploadImage(
    buffer: Buffer,
    options?: {
        folder?: string;
        publicId?: string;
        resourceType?: "image" | "auto";
        /** MIME type for the data URI (e.g. image/jpeg). Defaults to application/octet-stream. */
        mimeType?: string;
    }
): Promise<UploadResult> {
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
    }

    const mime = options?.mimeType ?? "application/octet-stream";
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder: options?.folder ?? "eena-pins/products",
        public_id: options?.publicId,
        resource_type: options?.resourceType ?? "image",
        overwrite: true,
    });

    return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width ?? 0,
        height: result.height ?? 0,
    };
}

export { cloudinary };
