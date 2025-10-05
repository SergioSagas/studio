'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
