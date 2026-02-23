'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

// Dynamically import WebGL components to avoid SSR issues
const AdvancedWebGLScene = dynamic(() => import('./components/AdvancedWebGLScene'), { ssr: false })
const AdvancedShaderScene = dynamic(() => import('./components/AdvancedShaderScene'), { ssr: false })
const UltraWebGLScene = dynamic(() => import('./components/UltraWebGLScene'), { ssr: false })

type SceneType = 'liquid' | 'holographic' | 'ultra'

export default function WebGLShowcase() {
  const [currentScene, setCurrentScene] = useState<SceneType>('liquid')

  const renderScene = () => {
    switch (currentScene) {
      case 'liquid':
        return <AdvancedWebGLScene />
      case 'holographic':
        return <AdvancedShaderScene />
      case 'ultra':
        return <UltraWebGLScene />
      default:
        return <AdvancedWebGLScene />
    }
  }

  const scenes = [
    { id: 'liquid', name: 'Liquid Marble', desc: 'Fluid marble shader with particles', color: 'from-blue-500 to-cyan-500' },
    { id: 'holographic', name: 'Holographic Glass', desc: 'Interference patterns with glass effects', color: 'from-purple-500 to-pink-500' },
    { id: 'ultra', name: 'Ultra Interactive', desc: 'Complex multi-effect with mouse interaction', color: 'from-indigo-500 to-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-linear-to-r from-pink-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-6"
          >
            <Link href="/">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 text-white hover:bg-white/10 backdrop-blur-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </button>
            </Link>
            <div className="text-right">
              <h1 className="text-3xl md:text-4xl font-black bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                WebGL Showcase
              </h1>
              <p className="text-slate-300 text-sm">Premium GPU-accelerated shader effects</p>
            </div>
          </motion.div>

          {/* Scene Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {scenes.map((scene) => (
              <motion.div
                key={scene.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setCurrentScene(scene.id as SceneType)}
                  className={`w-full p-6 h-auto flex flex-col items-start text-left bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 rounded-md ${
                    currentScene === scene.id
                      ? `bg-linear-to-r ${scene.color} text-white shadow-lg`
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <h3 className="text-lg font-semibold">{scene.name}</h3>
                    <Sparkles className={`h-5 w-5 ${currentScene === scene.id ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-sm opacity-80">{scene.desc}</p>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* WebGL Scene */}
      <div className="relative w-full h-screen mt-32">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          {renderScene()}
        </motion.div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">GPU Shaders</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Real-time GLSL shaders with advanced noise, refraction, and particle effects
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Generated</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Shader code autonomously created by specialized AI agents with validation
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Performance</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Optimized for 60fps with WebGL2, post-processing, and efficient rendering
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-slate-400 text-sm">
                Built with Three.js, React Three Fiber, and custom GLSL shaders •
                <span className="text-cyan-400"> Move mouse to interact</span> •
                <span className="text-purple-400"> GPU acceleration required</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}