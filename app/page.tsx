'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function Home () {
  return (
    <div className='relative flex items-center justify-center min-h-screen px-6 pt-32 overflow-hidden'>
      {/* Morphing Blob Background */}
      <div className='absolute inset-0 pointer-events-none -z-10'>
        <div className='absolute w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[150px] animate-pulse-slow left-[-20%] top-[-10%]' />
        <div className='absolute w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[150px] animate-pulse-mid right-[-15%] bottom-[-5%]' />
        <div className='absolute w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[180px] animate-pulse-slower left-[40%] top-[30%]' />
      </div>

      {/* Vinyl Animation Behind Hero */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className='absolute w-[500px] h-[500px] opacity-[0.09] -z-10'
      >
        <Image
          src='/vinyl.png'
          alt='vinyl'
          width={500}
          height={500}
          className='select-none'
        />
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='max-w-3xl space-y-8 text-center'
      >
        <h1 className='text-4xl font-bold leading-tight md:text-6xl'>
          Convert Your{' '}
          <span className='text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text'>
            Playlists
          </span>
          <br />
          Across Any Platform
        </h1>

        <p className='max-w-xl mx-auto text-lg text-slate-300'>
          FlowPlay lets you transfer your playlists between Spotify, Apple
          Music, YouTube Music, Tidal & more — instantly, beautifully, and
          accurately.
        </p>

        <div className='flex justify-center gap-6'>
          <Link
            href='/convert'
            className='px-6 py-3 font-medium text-white transition-all duration-300 shadow-lg rounded-xl bg-gradient-to-r from-green-500 to-blue-500 shadow-green-500/20 hover:opacity-90 hover:scale-105'
          >
            Start Converting
          </Link>

          <Link
            href='#features'
            className='px-6 py-3 font-medium text-white transition-all border rounded-xl bg-white/10 border-white/20 backdrop-blur-xl hover:bg-white/20 hover:scale-105'
          >
            Learn More
          </Link>
        </div>

        {/* Provider Icons Row */}
        <div className='flex justify-center gap-8 pt-6 opacity-80'>
          <motion.div
            whileHover={{ scale: 1.2 }}
            className='text-4xl text-green-400'
          >
            🟩
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            className='text-4xl text-pink-400'
          >
            🍎
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            className='text-4xl text-red-500'
          >
            🔴
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            className='text-4xl text-blue-400'
          >
            🌊
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
