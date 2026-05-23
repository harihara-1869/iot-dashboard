"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  icon: string;
  message: string;
  time: string;
}

export default function Topbar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleInactivityWarning() {
      const now = new Date();
      setNotifications((prev) => {
        if (prev.some((n) => n.id === "inactivity-warning")) return prev;
        return [
          {
            id: "inactivity-warning",
            icon: "timer_off",
            message: "You will be logged out soon due to inactivity",
            time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ];
      });
    }

    window.addEventListener("inactivity-warning", handleInactivityWarning);
    return () => window.removeEventListener("inactivity-warning", handleInactivityWarning);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function clearNotifications() {
    setNotifications([]);
    setShowDropdown(false);
  }

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-margin-desktop bg-surface border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <span className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary hidden md:block">
          Industrial Motor Control
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="relative text-on-surface-variant hover:text-primary transition-all active:opacity-80"
            >
              <span className="material-symbols-outlined">notifications</span>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl z-50">
                <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant">
                  <span className="font-sans text-[14px] leading-5 font-semibold text-on-surface">
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant hover:text-primary transition-colors"
                    >
                      CLEAR ALL
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center font-sans text-[14px] leading-5 text-on-surface-variant">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 border-b border-outline-variant/50 last:border-0 hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-error text-[20px] mt-0.5 flex-shrink-0">
                          {n.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[14px] leading-5 text-on-surface">
                            {n.message}
                          </p>
                          <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mt-0.5">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Link
            href="/help"
            className="text-on-surface-variant hover:text-primary transition-all active:opacity-80"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </Link>
          <Link
            href="/preferences"
            className="text-on-surface-variant hover:text-primary transition-all active:opacity-80"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
