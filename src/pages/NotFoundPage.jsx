import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link to="/capture" className="mt-4 inline-block text-white/70 underline">
          Take a photo instead
        </Link>
      </div>
    </main>
  )
}
