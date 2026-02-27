import { createClient } from "@supabase/supabase-js"
import type { PropertyVideo } from "@/lib/types";

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

export async function uploadVideoToSupabase(file: File): Promise<string> {
  if (!file) throw new Error("No video file selected");

  // Generar nombre único
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const fileName = `video-${timestamp}-${random}-${file.name}`;

  try {
    // Subir video a Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading video: ${error.message}`);
    }

    // Usar URL firmada (10 años)
    const EXPIRES_IN = 10 * 365 * 24 * 60 * 60; // 10 años en segundos
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(data.path, EXPIRES_IN);

    if (signedError || !signedData?.signedUrl) {
      throw new Error(`Error creating signed URL for video: ${signedError?.message ?? "Unknown"}`);
    }

    return signedData.signedUrl;
  } catch (error) {
    console.error("Video upload error:", error);
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
    console.log("Iniciando eliminación de imagen:", imageUrl);
    const filePath = extractFilePathFromStorageUrl(imageUrl);
    console.log("Path extraído del storage:", filePath);

    const { error, data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);
  
    
    if (error) {
      console.error("Error de Supabase al eliminar archivo:", error);
      throw new Error(`Error deleting file from storage: ${error.message}`);
    }

    console.log("Archivo eliminado exitosamente del storage:", data);
  } catch (error) {
    console.error("Error completo al eliminar imagen:", error);
    throw error;
  }
}

export async function deleteVideoFromSupabase(videoUrl: string): Promise<void> {
  try {
    console.log("Iniciando eliminación de video:", videoUrl);
    const filePath = extractFilePathFromStorageUrl(videoUrl);
    console.log("Path extraído del storage:", filePath);

    const { error, data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Error de Supabase al eliminar video:", error);
      throw new Error(`Error deleting video from storage: ${error.message}`);
    }

    console.log("Video eliminado exitosamente del storage:", data);
  } catch (error) {
    console.error("Error completo al eliminar video:", error);
    throw error;
  }
}

export async function saveVideoToDatabase(propertyId: string, videoUrl: string): Promise<PropertyVideo> {
  try {
    const { data, error } = await supabase
      .from('property_videos')
      .insert({
        property_id: propertyId,
        video_url: videoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error guardando video en base de datos:", error);
      throw new Error(`Error saving video to database: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error completo al guardar video en base de datos:", error);
    throw error;
  }
}

export async function deleteVideoFromDatabase(videoId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('property_videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      console.error("Error eliminando video de base de datos:", error);
      throw new Error(`Error deleting video from database: ${error.message}`);
    }
  } catch (error) {
    console.error("Error completo al eliminar video de base de datos:", error);
    throw error;
  }
}
