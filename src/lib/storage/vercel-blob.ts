import { del, get, put } from "@vercel/blob";

function getBlobToken(): string | undefined {
  return process.env.ADVISOR_BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
}

function blobPath(bucket: string, pathname: string): string {
  return `${bucket.replace(/^\/+|\/+$/g, "")}/${pathname.replace(/^\/+/, "")}`;
}

export async function putPrivateAsset(
  bucket: string,
  pathname: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
) {
  return put(blobPath(bucket, pathname), body, {
    access: "private",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: false,
    token: getBlobToken(),
  });
}

export async function getPrivateAsset(bucket: string, pathname: string) {
  const result = await get(blobPath(bucket, pathname), { access: "private", token: getBlobToken() });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const body = Buffer.from(await new Response(result.stream).arrayBuffer());
  return { body, contentType: result.blob.contentType ?? "application/octet-stream", contentDisposition: result.blob.contentDisposition };
}

export async function deletePrivateAsset(bucket: string, pathname: string): Promise<void> {
  await del(blobPath(bucket, pathname), { token: getBlobToken() });
}
