import { createHashRouter, Navigate } from 'react-router'
import CapturePage from '../pages/CapturePage'
import NotFoundPage from '../pages/NotFoundPage'
import WallPage from '../pages/WallPage'

export const router = createHashRouter([
  { path: '/', element: <Navigate to="/capture" replace /> },
  { path: '/capture', element: <CapturePage /> },
  { path: '/wall', element: <WallPage /> },
  { path: '*', element: <NotFoundPage /> },
])
