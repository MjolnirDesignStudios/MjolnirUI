'use client'
import { motion } from 'framer-motion'

export default function Tech() {
  return (
    <section className="py-24 px-4 relative">
      <div className="relative max-w-6xl mx-auto text-center">
        <motion.h2
          className="heading-2 mb-8 text-gradient"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Technology Stack
        </motion.h2>

        <motion.p
          className="text-lg text-slate-600 dark:text-slate-300 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Built with cutting-edge technologies for premium UI generation
        </motion.p>

        <motion.div
          className="text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          Coming Soon...
        </motion.div>
      </div>
    </section>
  )
}