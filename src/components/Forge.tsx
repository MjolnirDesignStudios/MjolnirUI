'use client'
import { motion } from 'framer-motion'
import { Zap, Sparkles, Rocket, Crown } from 'lucide-react'

export default function Forge() {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Advanced AI Models',
      description: 'Access to GPT-4, Claude, and specialized UI generation models'
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Unlimited Generations',
      description: 'Generate as many components as you need without limits'
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: 'Priority Processing',
      description: 'Skip the queue with lightning-fast generation times'
    },
    {
      icon: <Crown className="h-8 w-8" />,
      title: 'Premium Support',
      description: 'Direct access to our design experts and AI specialists'
    }
  ]

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-slate-800/50 dark:from-black/50 dark:to-slate-900/50" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-linear-to-r from-gold-500/10 to-electric-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-2 mb-6 text-gradient">
            Upgrade to Forge
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Unlock the full power of MjolnirUI with our premium Forge plan.
            Advanced AI models, unlimited generations, and priority support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/20 dark:group-hover:bg-slate-900/90 border border-white/20 dark:border-slate-700/20 h-full">
                <div className="absolute inset-0 bg-linear-to-br from-gold-500/10 via-electric-500/10 to-storm-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 pb-4 text-center p-6">
                  <div className="w-16 h-16 bg-linear-to-r from-gold-500 to-electric-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-gold-400 group-hover:to-electric-400 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                </div>
                <div className="relative z-10 text-center p-6 pt-0">
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <button className="px-12 py-4 bg-linear-to-r from-gold-500 to-electric-600 hover:from-gold-600 hover:to-electric-700 text-white rounded-full font-semibold text-xl shadow-2xl hover:shadow-gold-500/50 transition-all duration-300 transform hover:scale-105">
            Upgrade to Forge <Crown className="ml-2 h-6 w-6" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}