'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Box } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActiveInfrastructure({ containers, getStatusColor, setActiveTab }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Box className="h-4 w-4 text-primary" />
        <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-muted-foreground">Active Infrastructure</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {containers.map((container) => {
          const name = container.names?.[0]?.replace(/^\//, '');
          const state = container.state.toLowerCase();
          const isRunning = state === 'running';

          return (
            <div 
              key={container.id} 
              className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 cursor-pointer overflow-hidden" 
              onClick={() => setActiveTab(container.id)}
            >
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10 transition-all duration-300 group-hover:scale-110">
                    <Box className="h-4.5 w-4.5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                    isRunning ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isRunning ? "bg-emerald-500" : "bg-rose-500")} />
                    {container.state}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Container Name</p>
                    <p className="text-sm font-bold tracking-tight truncate">{name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-0.5">Image</p>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">{container.image.split(':')[0]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-0.5">Status</p>
                      <p className={cn("text-[10px] font-bold", isRunning ? "text-emerald-500/80" : "text-rose-500/80")}>{container.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
