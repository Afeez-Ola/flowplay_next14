'use client'
import React, { useState, useEffect } from 'react'
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

  // Poll for auth status
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
    interval = setInterval(checkAuth, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  const openAuthPopup = (provider: 'spotify' | 'youtube') => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      `/api/auth/${provider}`,
      `Connect ${provider}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const themeClass = {
    'Spotify': 'from-orange-900/40 via-pink-950/60 to-black border-orange-500/20 shadow-orange-500/10',
    'Apple Music': 'from-pink-900/40 via-purple-950/60 to-black border-pink-500/20 shadow-pink-500/10',
    'YouTube Music': 'from-red-900/40 via-orange-950/60 to-black border-red-500/20 shadow-red-500/10',
    'Tidal': 'from-purple-900/40 via-indigo-950/60 to-black border-purple-500/20 shadow-purple-500/10',
    'Deezer': 'from-indigo-900/40 via-blue-950/60 to-black border-indigo-500/20 shadow-indigo-500/10'
  }[to];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative p-8 space-y-6 overflow-hidden text-sm transition-all duration-700 ease-in-out rounded-3xl backdrop-blur-3xl border shadow-2xl before:absolute before:inset-0 before:rounded-3xl before:opacity-30 before:blur-[60px] before:pointer-events-none bg-gradient-to-br ${themeClass}`}
    >
      {/* Background Ambient Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse-slow [animation-delay:2s]" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">Source Playlist</label>
            <input
              className='w-full p-4 text-base border rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all'
              placeholder='Paste your playlist URL here...'
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">Target Name</label>
            <input
              className='w-full p-4 text-base border rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all'
              placeholder='New playlist name (optional)'
              value={playlistName}
              onChange={e => setPlaylistName(e.target.value)}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">From</label>
            <div className="relative">
              <select
                className='w-full p-3 appearance-none border rounded-xl bg-white/5 border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer'
                value={from}
                onChange={e => setFrom(e.target.value)}
              >
                {PROVIDERS.map(p => (
                  <option key={p} className="bg-slate-900 text-white">{p}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">To</label>
            <div className="relative">
              <select
                className='w-full p-3 appearance-none border rounded-xl bg-white/5 border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer'
                value={to}
                onChange={e => setTo(e.target.value)}
              >
                {PROVIDERS.map(p => (
                  <option key={p} className="bg-slate-900 text-white">{p}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            disabled={spotifyConnected}
            onClick={() => !spotifyConnected && openAuthPopup('spotify')}
            className={`flex items-center justify-center gap-2 w-full p-3 text-xs font-medium rounded-xl transition-all duration-300 border
              ${spotifyConnected 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 cursor-default shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-300'}`}
          >
            <span className={`w-2 h-2 rounded-full ${spotifyConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-white/30'}`} />
            {spotifyConnected ? 'Spotify Connected' : 'Connect Spotify'}
          </button>

          <button
            type="button"
            disabled={youtubeConnected}
            onClick={() => !youtubeConnected && openAuthPopup('youtube')}
            className={`flex items-center justify-center gap-2 w-full p-3 text-xs font-medium rounded-xl transition-all duration-300 border
              ${youtubeConnected 
                ? 'bg-red-500/20 border-red-500/30 text-red-300 cursor-default shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300'}`}
          >
            <span className={`w-2 h-2 rounded-full ${youtubeConnected ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse' : 'bg-white/30'}`} />
            {youtubeConnected ? 'YouTube Connected' : 'Connect YouTube'}
          </button>
        </div>

        <button
          disabled={
            !url ||
            from === to ||
            loading ||
            ((from === 'Spotify') && !spotifyConnected) ||
            ((from === 'YouTube Music') && !youtubeConnected)
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
          className={`group relative w-full p-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 overflow-hidden
            ${loading ? 'cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 transition-opacity duration-300 ${loading ? 'opacity-80' : 'opacity-100 group-hover:opacity-90'}`} />
          <div className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {!url ? 'Enter Playlist URL' :
                   from === to ? 'Select Different Target' :
                   (from === 'Spotify' && !spotifyConnected) ? 'Connect Spotify to Start' :
                   (from === 'YouTube Music' && !youtubeConnected) ? 'Connect YouTube to Start' :
                   'Start Conversion'}
                </span>
                <svg className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${(!url || from === to || ((from === 'Spotify') && !spotifyConnected) || ((from === 'YouTube Music') && !youtubeConnected)) ? 'hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </>
            )}
          </div>
        </button>
      </div>

      <AnimatePresence>
      {result && result.status === 'success' && (
        <motion.div
          id="results-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='relative overflow-hidden rounded-2xl bg-white/5 border border-white/10'
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${result.to === 'Apple Music' ? 'bg-pink-500/20 text-pink-400' : 'bg-red-500/20 text-red-400'}`}>
                  {result.to === 'Apple Music' ? (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.69-3.06 1.59-.65.77-1.2 2.02-1.07 3.12 1.17.09 2.35-.73 3.06-1.6z"/></svg>
                  ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  )}
                </div>
                <div>
                  <h3 className='font-semibold text-white'>Conversion Complete</h3>
                  <p className='text-xs text-white/60'>{result.matched_tracks} tracks matched</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setResult({ ...result, __tab: 'matched' })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${!result.__tab || result.__tab === 'matched' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                  Matched
                </button>
                <button
                  onClick={() => setResult({ ...result, __tab: 'unmatched' })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${result.__tab === 'unmatched' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                  Unmatched
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {result.playlist_url && (
                <>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.playlist_url)
                      alert('Link copied!')
                    }}
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-medium text-white group"
                  >
                    <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Copy Link
                  </button>
                  <a
                    href={result.playlist_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all text-xs font-medium text-white"
                  >
                    Open Playlist
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </>
              )}
            </div>

            <div className='space-y-2 overflow-y-auto max-h-60 custom-scrollbar pr-2'>
              {(!result.__tab || result.__tab === 'matched') ? (
                result.matches.map((m: any, i: number) => (
                  <div key={i} className='flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group'>
                    {m.apple?.artworkUrl100 || m.youtube?.thumbnailUrl ? (
                      <img
                        src={m.apple?.artworkUrl100 || m.youtube?.thumbnailUrl}
                        className='w-10 h-10 rounded-md shadow-sm'
                      />
                    ) : (
                      <div className='w-10 h-10 rounded-md bg-white/10 flex items-center justify-center'>
                        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-white truncate'>{m.source.name}</p>
                      <p className='text-xs text-white/60 truncate'>{m.source.artists}</p>
                    </div>
                  </div>
                ))
              ) : (
                result.unmatched.map((u: any, i: number) => (
                  <div key={i} className='flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10'>
                    <div className='w-10 h-10 rounded-md bg-red-500/10 flex items-center justify-center'>
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-red-200 truncate'>{u.name}</p>
                      <p className='text-xs text-red-400/60 truncate'>{u.artists}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && result && result.status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10" />
              
              <div className="relative p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Success!</h2>
                  <p className="text-white/60">
                    Your playlist has been converted to <span className="text-white font-medium">{result.to}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {result.playlist_url && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.playlist_url)
                        alert('Link copied!')
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Copy Playlist Link
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
