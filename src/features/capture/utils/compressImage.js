// Downscale + re-encode to JPEG before upload: phone photos are 3-12 MB, a wall tile needs far less.
// createImageBitmap applies EXIF orientation, and re-encoding turns iOS HEIC into JPEG.
export async function compressImage(file, maxSize = 1280, quality = 0.85) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process photo'))),
      'image/jpeg',
      quality,
    )
  })
}
