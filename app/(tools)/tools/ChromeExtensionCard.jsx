// app/(tools)/tools/ChromeExtensionCard.jsx
'use client';

import { motion } from 'framer-motion';

export default function ChromeExtensionCard({ icon, name, description, storeUrl }) {
  return (
    <motion.div
      onClick={() => window.open(storeUrl, '_blank')}
      className="relative cursor-pointer bg-card border border-border rounded-xl p-5 hover:bg-accent transition-colors"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        Extension
      </span>
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-semibold mb-1 text-foreground">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
