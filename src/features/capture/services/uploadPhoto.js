import axios from 'axios'
import { APP } from '../../../config/app'
import { publishMockPhoto } from '../../../services/mockChannel'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockUpload(blob, onProgress) {
  for (let step = 1; step <= 5; step++) {
    await wait(150)
    onProgress(step / 5)
  }
  return { id: publishMockPhoto(blob), url: null }
}

// POST sse.php, field "image" → 201 { success, data: { id, url, sse_status } }
// Errors → 4xx/5xx { error }. Resolves to { id, url }.
export async function uploadPhoto(blob, onProgress) {
  if (APP.useMock) return mockUpload(blob, onProgress)

  const form = new FormData()
  form.append('image', blob, 'photo.jpg')
  const { data } = await axios.post(APP.apiUrl, form, {
    onUploadProgress: (event) => event.total && onProgress(event.loaded / event.total),
  })
  return data.data
}
