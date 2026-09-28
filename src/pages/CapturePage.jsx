import { CaptureFlow } from '../features/capture'

export default function CapturePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">MosaicWall</h1>
        <p className="mt-1 text-sm text-white/60">Add your photo to the big screen</p>
      </header>
      <section className="flex flex-1 items-center justify-center py-8">
        <CaptureFlow />
      </section>
    </main>
  )
}
