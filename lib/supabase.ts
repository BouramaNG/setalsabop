import { createClient } from "@supabase/supabase-js";

// Client avec service_role — uniquement côté serveur (APIs)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Upload un fichier dans Supabase Storage
 * @param buffer   contenu du fichier
 * @param bucket   nom du bucket (ex: "kyc")
 * @param path     chemin dans le bucket (ex: "selfie_123.jpg")
 * @returns URL signée valable 10 ans
 */
export async function uploadToStorage(
  buffer: Buffer,
  bucket: string,
  filePath: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // URL signée valable 10 ans (bucket privé)
  const { data } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

  if (!data?.signedUrl) throw new Error("Impossible de générer l'URL");

  return data.signedUrl;
}
