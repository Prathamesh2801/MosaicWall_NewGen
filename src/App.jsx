import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router'
import { router } from './routes'

export default function App() {
  // reducedMotion="user": Framer drops transform animations when the OS asks for reduced motion.
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
