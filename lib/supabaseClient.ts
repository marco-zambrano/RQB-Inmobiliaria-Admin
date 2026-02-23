import { createClient } from "@supabase/supabase-js";

// These env vars should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Nombre del bucket en Supabase Storage (solo minúsculas, números y guiones; sin espacios)
export const STORAGE_BUCKET = "Pages File";

export async function uploadImageToSupabase(file: File): Promise<string> {
  if (!file) throw new Error("No file selected");

  // Generar nombre único
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const fileName = `${timestamp}-${random}-${file.name}`;

  try {
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Usar URL firmada (10 años) - funciona con buckets privados; las públicas fallan si el bucket no es público
    const EXPIRES_IN = 10 * 365 * 24 * 60 * 60; // 10 años en segundos
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(data.path, EXPIRES_IN);

    if (signedError || !signedData?.signedUrl) {
      throw new Error(`Error creating signed URL: ${signedError?.message ?? "Unknown"}`);
    }

    return signedData.signedUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export function extractFilePathFromStorageUrl(url: string): string {
  // Soporta URLs públicas (.../public/bucket/file) y firmadas (.../sign/bucket/file?token=...)
  // remove() necesita el path DENTRO del bucket (sin el nombre del bucket)
  const withoutQuery = url.split("?")[0];
  const segments = withoutQuery.split("/").filter(Boolean);
  const objectIdx = segments.indexOf("object");
  if (objectIdx >= 0 && segments[objectIdx + 1]) {
    const afterObject = segments.slice(objectIdx + 2).join("/");
    const decoded = decodeURIComponent(afterObject);
    // Quitar el prefijo del bucket (ej: "Pages File/filename" -> "filename")
    const bucketPrefix = STORAGE_BUCKET + "/";
    return decoded.startsWith(bucketPrefix) ? decoded.slice(bucketPrefix.length) : decoded;
  }
  return decodeURIComponent(segments[segments.length - 1] ?? "");
}

export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  try {
    const filePath = extractFilePathFromStorageUrl(imageUrl);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}
