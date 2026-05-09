'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Server, Database, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function SystemStatsCards({ systemStats }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'CPU Load', value: systemStats ? `${systemStats.currentLoad.currentLoad.toFixed(1)}%` : '...', icon: Server, color: 'emerald', progress: systemStats?.currentLoad.currentLoad },
        { label: 'Memory (RAM)', value: systemStats ? `${((systemStats.mem.active / systemStats.mem.total) * 100).toFixed(1)}%` : '...', icon: Database, color: 'sky', progress: (systemStats?.mem.active / systemStats?.mem.total) * 100, subValue: systemStats ? `(${(systemStats.mem.active / 1024 / 1024 / 1024).toFixed(1)}GB / ${(systemStats.mem.total / 1024 / 1024 / 1024).toFixed(1)}GB)` : null },
        { label: 'Uptime', value: systemStats && systemStats.time && typeof systemStats.time.uptime === 'number' ? formatDistanceToNow(new Date(Date.now() - systemStats.time.uptime * 1000)) : '...', icon: Activity, color: 'indigo', status: 'System Online' },
        { label: 'Disk Usage', value: systemStats && systemStats.fsSize && systemStats.fsSize.length > 0 ? `${systemStats.fsSize[0].use.toFixed(1)}%` : '...', icon: Server, color: 'orange', progress: systemStats?.fsSize?.[0]?.use, subValue: systemStats && systemStats.fsSize && systemStats.fsSize.length > 0 ? `(${(systemStats.fsSize[0].used / 1024 / 1024 / 1024).toFixed(0)}GB used)` : null },
      ].map((stat, i) => (
        <div key={i} className="relative group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/80">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className={cn(
                "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                stat.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                stat.color === 'sky' && "bg-sky-500/10 text-sky-500",
                stat.color === 'indigo' && "bg-indigo-500/10 text-indigo-500",
                stat.color === 'orange' && "bg-orange-500/10 text-orange-500"
              )}>
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.status && (
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border",
                  stat.color === 'emerald' && "text-emerald-500/80 bg-emerald-500/5 border-emerald-500/10",
                  stat.color === 'sky' && "text-sky-500/80 bg-sky-500/5 border-sky-500/10",
                  stat.color === 'indigo' && "text-indigo-500/80 bg-indigo-500/5 border-indigo-500/10",
                  stat.color === 'orange' && "text-orange-500/80 bg-orange-500/5 border-orange-500/10"
                )}>
                  {stat.status}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">{stat.label}</p>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight font-mono">{stat.value}</p>
                  {stat.subValue && <p className="text-[10px] text-muted-foreground font-mono">{stat.subValue}</p>}
                </div>
                {stat.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]",
                          stat.color === 'emerald' && "bg-emerald-500 shadow-emerald-500/20",
                          stat.color === 'sky' && "bg-sky-500 shadow-sky-500/20",
                          stat.color === 'indigo' && "bg-indigo-500 shadow-indigo-500/20",
                          stat.color === 'orange' && "bg-orange-500 shadow-orange-500/20"
                        )}
                        style={{ width: `${Math.max(2, Math.min(stat.progress, 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
