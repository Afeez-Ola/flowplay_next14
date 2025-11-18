'use client'
import React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROVIDERS = ['Spotify', 'Apple Music', 'YouTube Music', 'Tidal', 'Deezer']

export default function ConversionWizard () {
  const [from, setFrom] = useState('Spotify')
  const [to, setTo] = useState('Apple Music')
  const [url, setUrl] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [youtubeConnected, setYouTubeConnected] = useState(false)
  const [showModal, setShowModal] = useState(false)

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (data.spotify) setSpotifyConnected(true);
        if (data.youtube) setYouTubeConnected(true);
      } catch (e) {
        console.error("Auth check failed", e);
      }
    }
    checkAuth();
  }, []);

  const themeClass = {
    'Spotify': 'from-emerald-600/30 via-emerald-700/30 to-black/40 border-emerald-500/40 shadow-emerald-500/30 before:border-emerald-400/40',
    'Apple Music': 'from-pink-500/25 via-purple-700/20 to-black/40 border-pink-400/40 shadow-pink-500/30 before:border-pink-300/40',
    'YouTube Music': 'from-red-600/25 via-red-800/20 to-black/40 border-red-500/40 shadow-red-500/30 before:border-red-400/40',
    'Tidal': 'from-blue-600/25 via-blue-800/20 to-black/40 border-blue-400/40 shadow-blue-500/30 before:border-blue-300/40',
    'Deezer': 'from-indigo-500/25 via-purple-600/25 to-black/40 border-indigo-400/40 shadow-indigo-500/30 before:border-indigo-300/40'
  }[to];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative p-4 space-y-4 overflow-hidden text-xs transition-all duration-500 ease-in-out rounded-xl backdrop-blur-2xl border shadow-xl before:absolute before:inset-0 before:rounded-xl before:opacity-40 before:blur-[6px] overflow-hidden bg-gradient-to-br ${themeClass}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute text-4xl animate-float text-white/10" style={{ top: '10%', left: '5%' }}>♪</div>
        <div className="absolute text-5xl animate-float-slow text-white/10" style={{ top: '40%', left: '80%' }}>♫</div>
        <div className="absolute text-3xl animate-float text-white/10" style={{ top: '70%', left: '20%' }}>♬</div>
        <div className="absolute text-4xl animate-float text-white/10" style={{ top: '20%', left: '60%' }}>★</div>
        <div className="absolute text-4xl animate-float-slow text-white/10" style={{ top: '50%', left: '30%' }}>✦</div>
        <div className="absolute text-5xl animate-float text-white/10" style={{ top: '85%', left: '70%' }}>✧</div>
      </div>

      <input
        className='w-full p-2 border rounded bg-slate-800 border-slate-700'
        placeholder='Playlist URL (Spotify)'
        value={url}
        onChange={e => setUrl(e.target.value)}
      />

      <input
        className='w-full p-2 border rounded bg-slate-800 border-slate-700'
        placeholder='New playlist name on target (optional)'
        value={playlistName}
        onChange={e => setPlaylistName(e.target.value)}
      />

      <div className='grid grid-cols-2 gap-3'>
        <select
          className='p-2 border rounded bg-slate-800 border-slate-700'
          value={from}
          onChange={e => setFrom(e.target.value)}
        >
          {PROVIDERS.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          className='p-2 border rounded bg-slate-800 border-slate-700'
          value={to}
          onChange={e => setTo(e.target.value)}
        >
          {PROVIDERS.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <button
        disabled={
          !url ||
          from === to ||
          loading ||
          (from === 'Spotify' && !spotifyConnected) ||
          (from === 'YouTube Music' && !youtubeConnected)
        }
        onClick={async () => {
          try {
            setLoading(true)
            setResult(null)
            const res = await fetch('/api/convert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, from, to, playlistName })
            })
            const data = await res.json()
            setResult(data)
            if (data && data.status === 'success') {
              setShowModal(true)
              setTimeout(() => {
                document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" })
              }, 200)
            }
          } finally {
            setLoading(false)
          }
        }}
        className={`w-full p-2 rounded-md bg-gradient-to-r from-emerald-500 via-green-500 to-sky-500 disabled:from-slate-700 disabled:via-slate-700 disabled:to-slate-700 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-all duration-300 hover:scale-[1.02] active:scale-95`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-white/80 animate-bounce [animation-delay:-0.2s]" />
            <span className="w-1.5 h-5 rounded-full bg-white/70 animate-bounce" />
            <span className="w-1.5 h-4 rounded-full bg-white/60 animate-bounce [animation-delay:0.2s]" />
            <span className="text-[11px] tracking-wide uppercase text-white/90">
              Converting…
            </span>
          </div>
        ) : (
          'Start conversion'
        )}
      </button>

      <button
        disabled={spotifyConnected}
        onClick={() => {
          if (!spotifyConnected) {
            window.location.href = '/api/auth/spotify'
            setSpotifyConnected(true)
          }
        }}
        className={`block w-full p-2 text-xs text-center rounded 
          ${spotifyConnected ? 'bg-green-900 text-green-400 cursor-not-allowed' : 'bg-green-600 text-white'}`}
      >
        {spotifyConnected ? 'Spotify Connected ✔' : 'Connect Spotify'}
      </button>

      <button
        disabled={youtubeConnected}
        onClick={() => {
          if (!youtubeConnected) {
            window.location.href = '/api/auth/youtube'
            setYouTubeConnected(true)
          }
        }}
        className={`block w-full p-2 text-xs text-center rounded 
          ${youtubeConnected ? 'bg-red-900 text-red-400 cursor-not-allowed' : 'bg-red-600 text-white'}`}
      >
        {youtubeConnected ? 'YouTube Connected ✔' : 'Connect YouTube Music'}
      </button>

      <AnimatePresence>
      {result && result.status === 'success' && result.to === 'Apple Music' && (
        <motion.div
          id="results-section"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className='relative p-3 mt-4 space-y-3 text-xs border rounded-xl bg-gradient-to-br from-pink-500/15 via-slate-900/80 to-slate-950/90 backdrop-blur-xl border-pink-500/40 shadow-lg shadow-pink-500/30 transition-all duration-500 ease-in-out hover:shadow-2xl hover:scale-[1.01] before:absolute before:inset-0 before:rounded-xl before:border before:border-pink-400/40 before:opacity-60 before:blur-[4px] before:pointer-events-none overflow-hidden'
        >
          <div className="absolute -z-10 right-0 top-0 opacity-[0.05]">
            <motion.img
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              src="/vinyl.png"
              className="w-40 h-40 select-none"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg text-pink-400">🍎</span>
            <span className="text-xs text-white/80">Apple Music</span>
          </div>
          <h3 className='text-sm font-semibold text-white'>
            Apple Music Conversion Results
          </h3>
          <div className="flex justify-between p-2 text-xs rounded-md bg-white/10 text-white/80">
            <span>Matched: {result.matched_tracks}</span>
            <span>Unmatched: {result.unmatched_count}</span>
            <span>Total: {result.matches.length}</span>
          </div>

          {/* Share Link */}
          <button
            className='px-3 py-1 text-white transition-all duration-300 bg-blue-600 rounded hover:bg-blue-500 hover:scale-105 active:scale-95'
            onClick={() => {
              const text = result.matches
                .filter((m:any) => m.apple)
                .map((m:any) => `${m.source.name} — ${m.source.artists}\n${m.apple.appleMusicUrl}`)
                .join('\n\n')
              navigator.clipboard.writeText(text)
              alert('Share link copied!')
            }}
          >
            Copy Shareable Playlist Links
          </button>

          {/* Tabs */}
          <div className='flex gap-3 text-xs text-white'>
            <button
              onClick={() => setResult({ ...result, __tab: 'matched' })}
              className={`px-2 py-1 rounded transition-all duration-300 hover:scale-105 ${
                !result.__tab || result.__tab === 'matched'
                  ? 'bg-brand-600'
                  : 'bg-slate-700'
              }`}
            >
              Matched ({result.matched_tracks})
            </button>
            <button
              onClick={() => setResult({ ...result, __tab: 'unmatched' })}
              className={`px-2 py-1 rounded transition-all duration-300 hover:scale-105 ${
                result.__tab === 'unmatched'
                  ? 'bg-brand-600'
                  : 'bg-slate-700'
              }`}
            >
              Unmatched ({result.unmatched_count})
            </button>
          </div>

          {/* Matched Tracks */}
          {(!result.__tab || result.__tab === 'matched') && (
            <div className='pr-2 space-y-2 overflow-y-auto max-h-72'>
              {result.matches.map((m: any, i: number) => (
                <div key={i} className='group flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 transition-all duration-300 hover:bg-slate-800 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/20'>
                  
                  {/* Thumbnail */}
                  {m.apple?.artworkUrl100 ? (
                    <img
                      src={m.apple.artworkUrl100}
                      className='w-12 h-12 rounded'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded bg-slate-700' />
                  )}

                  {/* Track Info */}
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-white'>
                      {m.source.name}
                    </p>
                    <p className='text-slate-400'>{m.source.artists}</p>

                    {m.apple && (
                      <a
                        href={m.apple.appleMusicUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='block mt-1 text-blue-400 underline'
                      >
                        Open in Apple Music
                      </a>
                    )}
                  </div>

                  {/* Preview Audio */}
                  {m.apple?.previewUrl && (
                    <audio
                      className="w-0 h-0 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:h-8"
                      preload="auto"
                      onMouseEnter={e => e.currentTarget.play()}
                      onMouseLeave={e => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    >
                      <source src={m.apple.previewUrl} type="audio/mpeg" />
                    </audio>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Unmatched Tracks */}
          {result.__tab === 'unmatched' && (
            <div className='pr-2 space-y-2 overflow-y-auto max-h-72'>
              {result.unmatched.map((u: any, i: number) => (
                <div key={i} className='p-2 rounded-lg bg-slate-900/80 transition-all duration-300 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-md hover:shadow-red-500/20'>
                  <p className='font-semibold text-red-400'>{u.name}</p>
                  <p className='text-slate-300'>{u.artists}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {result && result.status === 'success' && result.to === 'YouTube Music' && (
        <motion.div
          id="results-section"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className='relative p-3 mt-4 space-y-3 text-xs border rounded-xl bg-gradient-to-br from-red-500/15 via-slate-900/80 to-slate-950/90 backdrop-blur-xl border-red-500/40 shadow-lg shadow-red-500/30 transition-all duration-500 ease-in-out hover:shadow-2xl hover:scale-[1.01] before:absolute before:inset-0 before:rounded-xl before:border before:border-red-400/40 before:opacity-60 before:blur-[4px] before:pointer-events-none overflow-hidden'
        >
          <div className="absolute -z-10 right-0 top-0 opacity-[0.05]">
            <motion.img
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              src="/vinyl.png"
              className="w-40 h-40 select-none"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg text-red-500">▶️</span>
            <span className="text-xs text-white/80">YouTube Music</span>
          </div>
          <h3 className='text-sm font-semibold text-white'>
            YouTube Music Conversion Results
          </h3>
          <div className="flex justify-between p-2 text-xs rounded-md bg-white/10 text-white/80">
            <span>Matched: {result.matched_tracks}</span>
            <span>Unmatched: {result.unmatched_count}</span>
            <span>Total: {result.matches.length}</span>
          </div>

          {/* Share Link */}
          <button
            className='px-3 py-1 text-white transition-all duration-300 bg-blue-600 rounded hover:bg-blue-500 hover:scale-105 active:scale-95'
            onClick={() => {
              if (result.playlist_url) {
                navigator.clipboard.writeText(result.playlist_url)
                alert('Playlist URL copied!')
              } else {
                alert('No playlist URL returned from YouTube')
              }
            }}
          >
            Copy Playlist Link
          </button>

          {/* Tabs */}
          <div className='flex gap-3 text-xs text-white'>
            <button
              onClick={() => setResult({ ...result, __tab: 'matched' })}
              className={`px-2 py-1 rounded transition-all duration-300 hover:scale-105 ${
                !result.__tab || result.__tab === 'matched'
                  ? 'bg-brand-600'
                  : 'bg-slate-700'
              }`}
            >
              Matched ({result.matched_tracks})
            </button>
            <button
              onClick={() => setResult({ ...result, __tab: 'unmatched' })}
              className={`px-2 py-1 rounded transition-all duration-300 hover:scale-105 ${
                result.__tab === 'unmatched'
                  ? 'bg-brand-600'
                  : 'bg-slate-700'
              }`}
            >
              Unmatched ({result.unmatched_count})
            </button>
          </div>

          {/* Matched Tracks */}
          {(!result.__tab || result.__tab === 'matched') && (
            <div className='pr-2 space-y-2 overflow-y-auto max-h-72'>
              {result.matches.map((m: any, i: number) => (
                <div key={i} className='group flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 transition-all duration-300 hover:bg-slate-800 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/20'>
                  
                  {/* Thumbnail */}
                  {m.youtube?.thumbnailUrl ? (
                    <img
                      src={m.youtube.thumbnailUrl}
                      className='w-12 h-12 rounded'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded bg-slate-700' />
                  )}

                  {/* Track Info */}
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-white'>
                      {m.source.name}
                    </p>
                    <p className='text-slate-400'>{m.source.artists}</p>

                    {m.youtube && (
                      <a
                        href={m.youtube.watchUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='block mt-1 text-blue-400 underline'
                      >
                        Open in YouTube Music
                      </a>
                    )}
                  </div>
                  {/* (YouTube has no built‑in preview in your code; leave thumbnail logic as-is) */}
                  {m.youtube?.previewUrl && (
                    <audio
                      className="w-0 h-0 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:h-8"
                      preload="auto"
                      onMouseEnter={e => e.currentTarget.play()}
                      onMouseLeave={e => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    >
                      <source src={m.youtube.previewUrl} type="audio/mpeg" />
                    </audio>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Unmatched Tracks */}
          {result.__tab === 'unmatched' && (
            <div className='pr-2 space-y-2 overflow-y-auto max-h-72'>
              {result.unmatched.map((u: any, i: number) => (
                <div key={i} className='p-2 rounded-lg bg-slate-900/80 transition-all duration-300 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-md hover:shadow-red-500/20'>
                  <p className='font-semibold text-red-400'>{u.name}</p>
                  <p className='text-slate-300'>{u.artists}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
      <AnimatePresence>
        {showModal && result && result.status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md p-6 text-center border shadow-xl bg-slate-900/90 rounded-2xl border-white/20"
            >
              {/* Confetti-like animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute text-5xl animate-float text-white/10" style={{ top: '10%', left: '15%' }}>✨</div>
                <div className="absolute text-5xl animate-float-slow text-white/10" style={{ top: '50%', left: '70%' }}>🎵</div>
                <div className="absolute text-4xl animate-float text-white/10" style={{ top: '75%', left: '30%' }}>💫</div>
              </div>

              <h2 className="mb-4 text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text">
                Playlist Converted!
              </h2>

              <p className="mb-6 text-slate-300">
                Your playlist was successfully converted to <span className="font-semibold text-white">{result.to}</span>.
              </p>

              {result.playlist_url && (
                <button
                  onClick={() => navigator.clipboard.writeText(result.playlist_url)}
                  className="w-full p-2 mb-3 text-white transition-all duration-300 bg-blue-600 rounded hover:bg-blue-500 hover:scale-105"
                >
                  Copy Playlist Link
                </button>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full p-2 text-white transition-all duration-300 rounded bg-slate-700 hover:bg-slate-600 hover:scale-105"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
