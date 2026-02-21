import { createClient } from "@supabase/supabase-js";

// These env vars should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImageToSupabase(file: File): Promise<string> {
  if (!file) throw new Error("No file selected");

  // Generar nombre único
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const fileName = `${timestamp}-${random}-${file.name}`;

  try {
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from("properties")
      .upload(`images/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from("properties")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  try {
    // Extraer el path del archivo de la URL pública
    // Formato: https://[project].supabase.co/storage/v1/object/public/properties/images/[filename]
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `images/${fileName}`;

    const { error } = await supabase.storage
      .from("properties")
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}
