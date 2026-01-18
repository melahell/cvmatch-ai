"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { formatRelativeDate } from "@/lib/formatters";

interface Notification {
    id: string;
    message: string;
    type: "job_match" | "profile_complete" | "cv_ready";
    read: boolean;
    created_at: string;
}

interface NotificationBellProps {
    notifications?: Notification[];
}

export function NotificationBell({ notifications = [] }: NotificationBellProps) {
    const unreadCount = notifications.filter(n => !n.read).length;

    if (notifications.length === 0) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="error"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-2 rounded text-sm ${notif.read ? 'bg-slate-50' : 'bg-blue-50'}`}
                            >
                                <p className="font-medium">{notif.message}</p>
                                <p className="text-xs text-slate-600 mt-1">
                                    {formatRelativeDate(notif.created_at)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
