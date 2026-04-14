import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

type UploadResult = {
  fileUrl: string;
  fileName: string;
  storage: "cloudinary" | "local";
};

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function hasCloudinaryCredentials() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function uploadToCloudinary(file: File, applicationNumber: string): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
  const timestamp = Math.floor(Date.now() / 1000);
  const extension = path.extname(file.name) || ".bin";
  const baseName = sanitizeSegment(path.basename(file.name, extension));
  const publicId = `${applicationNumber}/${baseName}-${timestamp}-${crypto.randomUUID().slice(0, 8)}`;
  const paramsToSign = `folder=admissions/${applicationNumber}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", timestamp.toString());
  uploadForm.append("signature", signature);
  uploadForm.append("folder", `admissions/${applicationNumber}`);
  uploadForm.append("public_id", publicId);
  uploadForm.append("resource_type", "auto");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: uploadForm,
  });

  if (!response.ok) {
    throw new Error("Unable to upload document.");
  }

  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Cloud storage did not return a document URL.");
  }

  return {
    fileUrl: data.secure_url,
    fileName: file.name,
    storage: "cloudinary",
  };
}

async function uploadToLocal(file: File, applicationNumber: string, documentKey: string): Promise<UploadResult> {
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "admissions", applicationNumber);
  await fs.mkdir(uploadDirectory, { recursive: true });
  const extension = path.extname(file.name) || ".bin";
  const fileName = `${documentKey}-${Date.now()}-${sanitizeSegment(path.basename(file.name, extension))}${extension}`;
  const targetPath = path.join(uploadDirectory, fileName);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer));

  return {
    fileUrl: `/uploads/admissions/${applicationNumber}/${fileName}`,
    fileName: file.name,
    storage: "local",
  };
}

export async function storeAdmissionUpload(args: {
  file: File;
  applicationNumber: string;
  documentKey: string;
}): Promise<UploadResult> {
  const { file, applicationNumber, documentKey } = args;

  if (hasCloudinaryCredentials()) {
    return uploadToCloudinary(file, applicationNumber);
  }

  return uploadToLocal(file, applicationNumber, documentKey);
}
