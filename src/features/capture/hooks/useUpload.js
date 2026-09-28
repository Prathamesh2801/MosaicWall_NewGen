import { useCallback, useState } from 'react'
import { uploadPhoto } from '../services/uploadPhoto'
import { compressImage } from '../utils/compressImage'

const IDLE = { status: 'idle', progress: 0, error: null }

// status: idle → compressing → uploading → queued | error
export function useUpload() {
  const [state, setState] = useState(IDLE)

  const upload = useCallback(async (file) => {
    try {
      setState({ ...IDLE, status: 'compressing' })
      // Browsers that can't decode the format (e.g. HEIC outside Safari) send the original file.
      const blob = await compressImage(file).catch(() => file)
      setState({ ...IDLE, status: 'uploading' })
      await uploadPhoto(blob, (progress) => setState((s) => ({ ...s, progress })))
      setState({ ...IDLE, status: 'queued' })
      navigator.vibrate?.(40) // subtle success haptic (Android; iOS ignores it)
    } catch (err) {
      const message = err.response?.data?.error ?? 'Upload failed. Check your connection and try again.'
      setState({ ...IDLE, status: 'error', error: message })
    }
  }, [])

  const reset = useCallback(() => setState(IDLE), [])

  return { ...state, upload, reset }
}
