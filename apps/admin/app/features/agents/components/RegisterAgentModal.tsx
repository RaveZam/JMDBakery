"use client";

import type { FormEvent, ReactElement, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getPasswordError } from "@/lib/getPasswordError";
import { PasswordChecklist } from "@/components/PasswordChecklist";

export type NewAgent = { email: string; name: string; password: string };

type RegisterAgentModalProps = {
  onClose: () => void;
  onRegister: (agent: NewAgent) => void;
};

function ModalOverlay({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <button
      type="button"
      className="absolute inset-0 bg-black/40"
      aria-label="Close"
      onClick={onClose}
    />
  );
}

function ModalPanel({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="pointer-events-auto w-full max-w-lg rounded-2xl border bg-background shadow-xl">
      {children}
    </div>
  );
}

function ModalHeader({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}): ReactElement {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
      <h2 id={titleId} className="text-base font-semibold">
        Register agent
      </h2>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-xl"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function RegisterAgentForm({
  titleId,
  emailId,
  nameId,
  passwordId,
  confirmId,
  emailRef,
  onClose,
  onRegister,
}: {
  titleId: string;
  emailId: string;
  nameId: string;
  passwordId: string;
  confirmId: string;
  emailRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onRegister: (agent: NewAgent) => void;
}): ReactElement {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    const passwordError = getPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    onRegister({ email: trimmedEmail, name: trimmedName, password });
    onClose();
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 px-5 py-4"
      aria-labelledby={titleId}
    >
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor={emailId} className="text-sm font-medium">
          Email
        </label>
        <Input
          ref={emailRef}
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Agent email"
          className="rounded-2xl"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={nameId} className="text-sm font-medium">
          Name
        </label>
        <Input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Agent name"
          className="rounded-2xl"
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={passwordId} className="text-sm font-medium">
          Password
        </label>
        <PasswordInput
          id={passwordId}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-2xl"
          autoComplete="new-password"
        />
        <PasswordChecklist password={password} />
      </div>
      <div className="space-y-2">
        <label htmlFor={confirmId} className="text-sm font-medium">
          Confirm password
        </label>
        <PasswordInput
          id={confirmId}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-2xl"
          autoComplete="new-password"
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" className="rounded-2xl">
          Register
        </Button>
      </div>
    </form>
  );
}

function RegisterAgentPortal({
  titleId,
  emailId,
  nameId,
  passwordId,
  confirmId,
  emailRef,
  onClose,
  onRegister,
}: {
  titleId: string;
  emailId: string;
  nameId: string;
  passwordId: string;
  confirmId: string;
  emailRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onRegister: (agent: NewAgent) => void;
}): ReactElement {
  return createPortal(
    <div
      className="fixed inset-0 z-50"
      aria-labelledby={titleId}
      role="dialog"
      aria-modal="true"
    >
      <ModalOverlay onClose={onClose} />
      <div className="pointer-events-none relative flex h-full w-full items-start justify-center p-4 sm:p-8">
        <ModalPanel>
          <ModalHeader titleId={titleId} onClose={onClose} />
          <RegisterAgentForm
            titleId={titleId}
            emailId={emailId}
            nameId={nameId}
            passwordId={passwordId}
            confirmId={confirmId}
            emailRef={emailRef}
            onClose={onClose}
            onRegister={onRegister}
          />
        </ModalPanel>
      </div>
    </div>,
    document.body,
  );
}

export function RegisterAgentModal({
  onClose,
  onRegister,
}: RegisterAgentModalProps): ReactElement | null {
  const titleId = `${useId()}-title`;
  const emailId = useId();
  const nameId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return (): void => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;
  return (
    <RegisterAgentPortal
      titleId={titleId}
      emailId={emailId}
      nameId={nameId}
      passwordId={passwordId}
      confirmId={confirmId}
      emailRef={emailRef}
      onClose={onClose}
      onRegister={onRegister}
    />
  );
}
