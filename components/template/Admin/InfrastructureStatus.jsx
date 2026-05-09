'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Server, Shield, Sparkles, Mail, Image as ImageIcon, Activity, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InfrastructureStatus({ serviceStatuses, checkingServices }) {
  const services = [
    { id: 'backend', label: 'Backend API', icon: Server, color: 'emerald' },
    { id: 'cloudinary', label: 'Cloudinary', icon: ImageIcon, color: 'sky' },
    { id: 'firebase', label: 'Firebase Auth', icon: Shield, color: 'amber' },
    { id: 'gemini', label: 'Gemini AI', icon: Sparkles, color: 'indigo' },
    { id: 'resend', label: 'Resend Email', icon: Mail, color: 'rose' },
    { id: 'cloudflare', label: 'Cloudflare', icon: Activity, color: 'orange' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-muted-foreground">External Infrastructure</h2>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {services.map((svc) => {
          const status = serviceStatuses[svc.id] || { status: 'pending', message: 'Loading...' };
          const isError = status.status === 'error';
          const isPending = status.status === 'pending';

          return (
            <div 
              key={svc.id} 
              className="relative group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className={cn(
                "absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                isError ? "bg-rose-500" : `bg-${svc.color}-500`
              )} />

              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                    isError ? "bg-rose-500/10 text-rose-500" : `bg-${svc.color}-500/10 text-${svc.color}-500`
                  )}>
                    <svc.icon className="h-4.5 w-4.5" />
                  </div>
                  
                  {isPending ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-full border border-border/50">
                      <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Syncing</span>
                    </div>
                  ) : isError ? (
                    <div className="h-6 w-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">{svc.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={cn(
                      "text-sm font-bold tracking-tight",
                      isError ? "text-rose-500" : "text-foreground"
                    )}>
                      {isError ? 'Error' : status.status === 'pending' ? 'Checking...' : 'Configured'}
                    </p>
                    {!isError && !isPending && (
                      <span className="text-[10px] text-emerald-500/70 font-mono font-medium">Active</span>
                    )}
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
