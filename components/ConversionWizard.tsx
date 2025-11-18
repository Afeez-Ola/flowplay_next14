'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROVIDERS = ['Spotify', 'Apple Music', 'YouTube Music', 'Tidal', 'Deezer']

export default function ConversionWizard () {
  const [from, setFrom] = useState('Spotify')
  const [to, setTo] = useState('Apple Music')
  const [url, setUrl] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [result, setResult] = useState<any | null>(null)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className='relative p-4 space-y-4 overflow-hidden text-xs transition-all duration-300 ease-in-out shadow-xl bg-gradient-to-b from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl'>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute text-4xl animate-float text-white/10" style={{ top: '10%', left: '5%' }}>♪</div>
        <div className="absolute text-5xl animate-float-slow text-white/10" style={{ top: '40%', left: '80%' }}>♫</div>
        <div className="absolute text-3xl animate-float text-white/10" style={{ top: '70%', left: '20%' }}>♬</div>
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
        disabled={!url || from === to}
        onClick={async () => {
          const res = await fetch('/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, from, to, playlistName })
          })
          const data = await res.json()
          setResult(data)
        }}
        className='w-full p-2 rounded bg-brand-600 disabled:bg-slate-700'
      >
        Start conversion
      </button>

      <a
        href='/api/auth/spotify'
        className='block w-full p-2 text-xs text-center text-white bg-green-600 rounded'
      >
        Connect Spotify
      </a>

      <a
        href='/api/auth/youtube'
        className='block w-full p-2 text-xs text-center text-white bg-red-600 rounded'
      >
        Connect YouTube Music
      </a>

      <AnimatePresence>
      {result && result.status === 'success' && result.to === 'Apple Music' && (
        <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.35 }} className='p-3 mt-4 space-y-3 text-xs border rounded bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-slate-700 shadow-lg transition-all duration-500 ease-in-out hover:shadow-2xl hover:scale-[1.01]'>
          <h3 className='text-sm font-semibold text-white'>
            Apple Music Conversion Results
          </h3>

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
                <div key={i} className='flex items-center gap-3 p-2 rounded bg-slate-900 transition-all duration-300 hover:bg-slate-700 hover:scale-[1.02]'>
                  
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
                    <audio controls className='h-8'>
                      <source src={m.apple.previewUrl} type='audio/mpeg' />
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
                <div key={i} className='p-2 rounded bg-slate-900 transition-all duration-300 hover:bg-slate-700 hover:scale-[1.01]'>
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
        <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.35 }} className='p-3 mt-4 space-y-3 text-xs border rounded bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-slate-700 shadow-lg transition-all duration-500 ease-in-out hover:shadow-2xl hover:scale-[1.01]'>
          <h3 className='text-sm font-semibold text-white'>
            YouTube Music Conversion Results
          </h3>

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
                <div key={i} className='flex items-center gap-3 p-2 rounded bg-slate-900 transition-all duration-300 hover:bg-slate-700 hover:scale-[1.02]'>
                  
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
                </div>
              ))}
            </div>
          )}

          {/* Unmatched Tracks */}
          {result.__tab === 'unmatched' && (
            <div className='pr-2 space-y-2 overflow-y-auto max-h-72'>
              {result.unmatched.map((u: any, i: number) => (
                <div key={i} className='p-2 rounded bg-slate-900 transition-all duration-300 hover:bg-slate-700 hover:scale-[1.01]'>
                  <p className='font-semibold text-red-400'>{u.name}</p>
                  <p className='text-slate-300'>{u.artists}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  )
}


