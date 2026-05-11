import { supabase } from "@/integrations/supabase/client";

export type UploadedProductAsset = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  modelUrl: string;
  originalName: string;
  bucketId: string;
  filePath: string;
  extension: string;
};

type UploadedFileRow = {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  bucket_id: string;
  file_type: string;
  metadata: unknown;
};

function getPublicUrl(row: UploadedFileRow): string {
  const publicUrl =
    typeof row.metadata === "object" && row.metadata !== null && "publicUrl" in row.metadata
      ? String((row.metadata as { publicUrl?: unknown }).publicUrl ?? "")
      : "";

  if (publicUrl) {
    return publicUrl;
  }

  return supabase.storage.from(row.bucket_id).getPublicUrl(row.file_path).data.publicUrl;
}

function slugifyUploadedModel(row: UploadedFileRow): string {
  const sourceName = (row.original_name || row.file_name).replace(/\.[^.]+$/, "");
  return sourceName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "") || row.id;
}

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function mapUploadedModel(row: UploadedFileRow): UploadedProductAsset {
  const title = (row.original_name || row.file_name).replace(/\.[^.]+$/, "");
  const slug = `upload-${slugifyUploadedModel(row)}`;

  return {
    id: `uploaded-${row.id}`,
    slug,
    name_ar: title,
    name_en: title.toUpperCase(),
    modelUrl: getPublicUrl(row),
    originalName: row.original_name || row.file_name,
    bucketId: row.bucket_id,
    filePath: row.file_path,
    extension: getExtension(row.original_name || row.file_name),
  };
}

export async function fetchUploadedProductModels(limit = 12): Promise<UploadedProductAsset[]> {
  const { data, error } = await supabase
    .from("uploaded_files")
    .select("id, file_name, original_name, file_path, bucket_id, file_type, metadata")
    .eq("file_type", "3d-model")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return ((data ?? []) as UploadedFileRow[]).map(mapUploadedModel);
}

export async function fetchUploadedProductModelBySlug(slug: string | null | undefined): Promise<UploadedProductAsset | null> {
  if (!slug?.startsWith("upload-")) {
    return null;
  }

  const models = await fetchUploadedProductModels(100);
  return models.find((model) => model.slug === slug) ?? null;
}