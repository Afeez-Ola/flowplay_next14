import { ConversionWizard } from "./ConversionWizard";

export function ConversionHero() {
  return (
    <section className="container grid gap-10 md:grid-cols-2 items-center">
      <div>
        <h1 className="text-4xl font-semibold">Move your playlists anywhere</h1>
        <p className="text-sm text-slate-300 mt-3">
          AI-powered playlist conversion across Spotify, Apple Music, YouTube Music & more.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <ConversionWizard />
      </div>
    </section>
  );
}