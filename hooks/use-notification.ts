"use client";

import { useEffect, useState, useCallback } from "react";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { Notification } from "@/types/notification";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export function useNotification(userId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const handleNotificationSent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setNotifications((prev) => [customEvent.detail, ...prev]);
      }
    };

    window.addEventListener("notification-sent", handleNotificationSent);

    return () => {
      window.removeEventListener("notification-sent", handleNotificationSent);
    };
  }, []);

  useEffect(() => {
    if (!userId || !WS_URL) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      ws.send(JSON.stringify({ type: "register", user_id: userId }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "notification") {
          setNotifications((prev) => [message.data, ...prev]);
        }
      } catch (error) {
        console.error("Failed to parse notification message:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [userId]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      if (socket) {
        socket.send(JSON.stringify({ type: "markAsRead", notificationId }));
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    },
    [socket],
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await httpClient.post(
        API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ(userId),
      );

      if (res.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [userId]);

  return { isConnected, notifications, markAsRead, markAllAsRead };
}
