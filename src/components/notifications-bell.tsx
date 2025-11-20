'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Award, AlertCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  message: string;
  type: 'reputation_gain' | 'reputation_loss' | 'report_confirmed' | 'report_disputed';
  timestamp: Timestamp; // Changed from string to Timestamp
  read: boolean;
};

export function NotificationsBell() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const notificationsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, 'users', user.uid, 'notifications'),
            orderBy('timestamp', 'desc'),
            limit(10)
          )
        : null,
    [user, firestore]
  );

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  // Play sound on new unread notification
  useEffect(() => {
    if (unreadCount > 0) {
      const latestNotification = notifications?.[0];
      if (latestNotification && !latestNotification.read) {
         audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
      }
    }
  }, [notifications, unreadCount]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0 && firestore && user && notifications) {
      // Mark all visible notifications as read
      const batch = writeBatch(firestore);
      notifications.forEach(notif => {
        if (!notif.read) {
          const notifRef = doc(firestore, 'users', user.uid, 'notifications', notif.id);
          batch.update(notifRef, { read: true });
        }
      });
      await batch.commit();
    }
  };
  
  const getIcon = (type: Notification['type']) => {
      switch(type) {
          case 'reputation_gain':
          case 'report_confirmed':
              return <Award className="size-4 text-green-500" />;
          case 'reputation_loss':
          case 'report_disputed':
              return <AlertCircle className="size-4 text-yellow-500" />;
          default:
            return <Bell className="size-4" />;
      }
  }

  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (!timestamp) {
        return 'Invalid date';
    }
    // Firestore Timestamps have a toDate() method.
    return timestamp.toDate().toLocaleString();
  };


  return (
    <>
      <audio ref={audioRef} src="/sounds/success.mp3" preload="auto" />
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications && notifications.length > 0 ? (
            notifications.map(notif => (
              <DropdownMenuItem key={notif.id} className={cn("flex items-start gap-3 whitespace-normal", !notif.read && "font-bold")}>
                <div className="mt-1">
                    {getIcon(notif.type)}
                </div>
                <div className="flex flex-col">
                    <p className="text-sm leading-snug">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(notif.timestamp)}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No tienes notificaciones.</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
