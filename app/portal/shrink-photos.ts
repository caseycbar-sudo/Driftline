/** Phone photos are 3 to 12 MB each. Scale them down before upload so a visit's photos fit in one request. */
const MAX_SIDE = 1800;

export async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 600 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Replace every photo in a form with a smaller copy. */
export async function shrinkFormPhotos(form: FormData, names: string[]) {
  for (const name of names) {
    const files = form.getAll(name).filter((v): v is File => v instanceof File && v.size > 0);
    if (!files.length) continue;
    const smaller = await Promise.all(files.map(shrinkImage));
    form.delete(name);
    smaller.forEach((file) => form.append(name, file));
  }
}
