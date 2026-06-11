'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const EditStatusModal = dynamic(() => import('./EditStatusModal'), { ssr: false });
import { Edit2, Plus } from 'lucide-react';

export default function StatusBadge() {
  const status = useAdminStatus();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isOnline = status.online;
  const isBusy = status.busy;
  const statusText = status.text;
  const hasStatus = Boolean(statusText);

  // Spec rule: no status text → no badge. Exception: an admin gets a dashed
  // "Set status" placeholder so they have a clickable entry point.
  if (!hasStatus && !isAdmin) return null;

  // Dot color per spec: gray when offline, green when online, red when busy.
  let dotColor;
  if (!isOnline) {
    dotColor = 'bg-zinc-500';
  } else if (isBusy) {
    dotColor = 'bg-rose-500';
  } else {
    dotColor = 'bg-emerald-500';
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center"
      >
        {hasStatus ? (
          <button
            onClick={() => isAdmin && setModalOpen(true)}
            disabled={!isAdmin}
            aria-label={isAdmin ? 'Edit status' : `Status: ${statusText}`}
            className={`flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-neutral-950/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 select-none group text-left ${isAdmin
              ? 'cursor-pointer hover:border-blue-500/50 hover:bg-neutral-950 hover:scale-105'
              : 'cursor-default hover:border-white/20 hover:scale-105'
              }`}
          >
            <span className="relative flex h-2 w-2 mr-2 shrink-0">
              {isOnline && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
                />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}
              />
            </span>

            <span className="text-[10px] font-mono tracking-wide text-zinc-300 font-medium whitespace-nowrap max-w-[180px] truncate group-hover:text-white transition-colors duration-200">
              {statusText}
            </span>

            {isAdmin && (
              <span className="w-0 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:w-2 group-hover:opacity-100 group-hover:ml-1.5 flex items-center justify-center shrink-0">
                <Edit2
                  size={8}
                  className="text-zinc-500 group-hover:text-blue-400 transition-colors duration-200"
                />
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Set status"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-white/15 bg-neutral-950/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer hover:border-blue-500/50 hover:bg-neutral-950 hover:scale-105 group"
          >
            <Plus
              size={10}
              className="text-zinc-400 group-hover:text-blue-400 transition-colors"
            />
            <span className="text-[10px] font-mono tracking-wide text-zinc-400 font-medium whitespace-nowrap group-hover:text-white transition-colors">
              Set status
            </span>
          </button>
        )}
      </motion.div>

      {isAdmin && (
        <EditStatusModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          current={status}
        />
      )}
    </>
  );
}
