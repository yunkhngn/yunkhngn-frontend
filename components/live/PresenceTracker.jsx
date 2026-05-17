'use client';

import { useAdminPresence } from '@/hooks/useAdminPresence';

export default function PresenceTracker() {
  useAdminPresence();
  return null;
}
