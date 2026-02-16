"use client";

import { Bell, BellOff, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/reui/badge";
import { useNotification } from "@/hooks/use-notification";
import { useProfile } from "@/hooks/use-profile";
import type { Notification } from "@/types/notification";
import EmptyComponent from "../empty-component";

const TYPE_BADGE_VARIANT: Record<
  Notification["type"],
  "info-light" | "destructive-light" | "warning-light" | "success-light"
> = {
  info: "info-light",
  error: "destructive-light",
  warning: "warning-light",
  success: "success-light",
};

interface NotificationItemProps {
  readonly notification: Notification;
  readonly onMarkAsRead: (id: string) => void;
}

const formatMessage = (message: string) => {
  const parts = message.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part) => {
    const match = /^\[(.*?)\]\((.*?)\)$/.exec(part);
    if (match) {
      return (
        <Link
          key={match[2]}
          href={match[2]}
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          onClick={(e) => e.stopPropagation()}
        >
          {match[1]}
        </Link>
      );
    }
    return part;
  });
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationItemProps) => {
  return (
    <div className="group relative flex items-start gap-2 px-3 py-2 hover:bg-muted/50 transition-colors">
      {notification.link && (
        <Link
          href={notification.link}
          className="absolute inset-0 z-10 border-b"
        />
      )}
      <div className="flex-1 min-w-0 relative z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <Badge variant={TYPE_BADGE_VARIANT[notification.type]} size="xs">
            {notification.type}
          </Badge>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {new Date(notification.created_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-xs font-medium mt-0.5 truncate">
          {notification.title}
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 pointer-events-auto">
          {formatMessage(notification.message)}
        </p>
      </div>
      <button
        onClick={() => onMarkAsRead(notification.id)}
        className="relative z-20 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        type="button"
        title="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
};

export default function Notification() {
  const { userId } = useProfile();
  const { notifications, markAsRead, markAllAsRead } = useNotification(userId);

  const notificationCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative inline-flex justify-center items-center w-7 h-7"
          size="sm"
        >
          <Bell className="h-3.5 w-3.5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -end-1 inline-flex items-center justify-center size-4 rounded-full text-[9px] font-semibold bg-destructive text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-88 max-h-96 p-0 shadow-lg mx-4" align="end">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
          <span className="text-xs font-semibold tracking-tight">
            Notifications
          </span>
          {notificationCount > 0 && (
            <Button
              variant="ghost"
              className="text-[10px] h-5 px-1.5 text-muted-foreground"
              size="sm"
              onClick={markAllAsRead}
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="divide-y overflow-y-auto max-h-80">
          {notifications.length === 0 ? (
            <EmptyComponent
              icon={BellOff}
              title="No Notifications Yet"
              description="You haven't Notifications yet."
            />
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
