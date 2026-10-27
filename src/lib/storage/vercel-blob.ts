import { del, get, put } from "@vercel/blob";
import { createSupabaseStorageAdminClient } from "@/lib/supabase/server-admin";

function getBlobToken(): string | undefined {
  return process.env.ADVISOR_BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
}

function useBlobStorage(): boolean {
  return process.env.ADVISOR_STORAGE_PROVIDER?.trim().toLowerCase() === "vercel_blob";
}

export async function putPrivateAsset(
  bucket: string,
  pathname: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
) {
  if (!useBlobStorage()) {
    const { error } = await createSupabaseStorageAdminClient().storage.from(bucket).upload(pathname, body, {
      contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return;
  }
  return put(pathname, body, {
    access: "private",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: false,
    token: getBlobToken(),
  });
}

export async function getPrivateAsset(bucket: string, pathname: string) {
  if (!useBlobStorage()) {
    const { data, error } = await createSupabaseStorageAdminClient().storage.from(bucket).download(pathname);
    if (error || !data) throw new Error(error?.message ?? "ASSET_NOT_FOUND");
    return {
      body: Buffer.from(await data.arrayBuffer()),
      contentType: data.type || "application/octet-stream",
      contentDisposition: undefined,
    };
  }
  const result = await get(pathname, { access: "private", token: getBlobToken() });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const body = Buffer.from(await new Response(result.stream).arrayBuffer());
  return { body, contentType: result.blob.contentType ?? "application/octet-stream", contentDisposition: result.blob.contentDisposition };
}

export async function deletePrivateAsset(bucket: string, pathname: string): Promise<void> {
  if (!useBlobStorage()) {
    const { error } = await createSupabaseStorageAdminClient().storage.from(bucket).remove([pathname]);
    if (error) throw new Error(error.message);
    return;
  }
  await del(pathname, { token: getBlobToken() });
}
