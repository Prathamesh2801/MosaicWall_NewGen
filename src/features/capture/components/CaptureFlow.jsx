import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useUpload } from '../hooks/useUpload'
import CameraButton from './CameraButton'
import PhotoPreview from './PhotoPreview'
import SubmitStatus from './SubmitStatus'

export default function CaptureFlow() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const { status, progress, error, upload, reset } = useUpload()

  // Free the preview blob when it's replaced or the flow unmounts.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  const capture = (photo) => {
    setFile(photo)
    setPreviewUrl(URL.createObjectURL(photo))
  }

  const startOver = () => {
    setFile(null)
    setPreviewUrl(null)
    reset()
  }

  let step = 'camera'
  if (file) step = 'preview'
  if (status === 'queued') step = 'done'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full justify-center"
      >
        {step === 'camera' && <CameraButton onCapture={capture} />}
        {step === 'preview' && (
          <PhotoPreview
            src={previewUrl}
            status={status}
            progress={progress}
            error={error}
            onRetake={startOver}
            onSubmit={() => upload(file)}
          />
        )}
        {step === 'done' && <SubmitStatus photoUrl={previewUrl} onAgain={startOver} />}
      </motion.div>
    </AnimatePresence>
  )
}
