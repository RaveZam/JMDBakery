"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { getUserEmail } from "../services/getUserEmail";
import { signOutUser } from "../services/signOutUser";

export function AccountCard() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState<string | null>();
  useEffect(() => {
    async function getEmail() {
      const email = await getUserEmail();
      setEmail(email);
    }
    getEmail();
  }, []);
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onOutside);
    return () => window.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 hover:bg-muted"
        aria-expanded={open}
      >
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border bg-muted-foreground/10" />
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">{email || "No email"}</p>
          <p className="text-xs text-muted-foreground">Account preferences</p>
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 bottom-14 z-50 w-56 rounded-2xl border bg-card shadow-lg">
          <div className="px-4 py-3">
            <p className="text-sm font-medium">{email || "No email"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Manage your account or sign out.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
            <button
              type="button"
              onClick={() => {
                signOutUser();
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AccountCard;
