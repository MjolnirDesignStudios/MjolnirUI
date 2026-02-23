'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send } from 'lucide-react'

export default function Agent() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      if (data.code) {
        console.log('Generated UI Code:', data.code)
        alert('UI component generated successfully! Check console for code.')
        setPrompt('')
      } else {
        alert('Error generating UI: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate UI')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="py-24 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h2
          className="heading-2 mb-8 text-gradient"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Create with AI Agents
        </motion.h2>

        <motion.p
          className="text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Describe your vision and let our AI agents craft premium animated UI components
        </motion.p>

        <motion.div
          className="relative max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the UI component you want to create..."
              className="w-full px-6 py-4 pr-16 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 shadow-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Sparkles className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}