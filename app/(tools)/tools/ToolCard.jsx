// yunkhngn-fe/app/(tools)/tools/ToolCard.jsx
'use client';

import { motion } from 'framer-motion';

export default function ToolCard({ id, icon: Icon, name, description, onClick, badge }) {
  return (
    <motion.div
      onClick={onClick}
      className="relative cursor-pointer bg-card border border-border rounded-xl p-5 hover:bg-accent transition-colors"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {badge}
        </span>
      )}
      {Icon && <Icon className="w-8 h-8 text-foreground mb-3" />}
      <h3 className="font-semibold mb-1 text-foreground">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
