// yunkhngn-fe/app/(tools)/tools/ToolCard.jsx
'use client';

import { motion } from 'framer-motion';

export default function ToolCard({ id, icon, name, description, onClick }) {
  return (
    <motion.div
      layoutId={`tool-${id}`}
      onClick={onClick}
      className="cursor-pointer bg-card border border-border rounded-xl p-5 hover:bg-accent transition-colors"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-semibold mb-1 text-foreground">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
