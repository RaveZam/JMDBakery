"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  RegisterAdminModal,
  type NewAdmin,
} from "./RegisterAdminModal";
import { AdminGrid } from "./AdminGrid";
import { createAdmin } from "../services/createAdmin";
import { deleteAdmin } from "../services/deleteAdmin";
import { getAdmins } from "../services/adminsService";
import type { AdminRow } from "../types/admin-types";

export function AdminsClient({
  admins: initialAdmins,
}: {
  admins: AdminRow[];
}): ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const [admins, setAdmins] = useState(initialAdmins);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDeleteAdmin = admins.find((a) => a.id === pendingDeleteId);

  function handleRegister(admin: NewAdmin): void {
    createAdmin({
      email: admin.email,
      name: admin.name,
      password: admin.password,
      confirmPassword: admin.password,
    }).then(() => {
      getAdmins().then(setAdmins);
    });
  }

  function handleConfirmDelete(): void {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    deleteAdmin(id).catch(() => {
      getAdmins().then(setAdmins);
    });
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
        <div className="mx-auto w-full max-w-[1200px] space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Admins</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Admin accounts and access management.
              </p>
            </div>
            <Button
              type="button"
              className="rounded-2xl"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Register admin
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px]">
          {admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
              <ShieldCheck className="h-10 w-10 opacity-50" />
              <p className="text-sm">No admins yet.</p>
              <p className="text-xs">Register an admin to get started.</p>
            </div>
          ) : (
            <AdminGrid admins={admins} loading={false} onDelete={setPendingDeleteId} />
          )}
        </div>
      </div>

      {modalOpen ? (
        <RegisterAdminModal
          onClose={() => setModalOpen(false)}
          onRegister={handleRegister}
        />
      ) : null}

      {pendingDeleteId && pendingDeleteAdmin ? (
        <ConfirmDeleteModal
          title={`Delete ${pendingDeleteAdmin.name}?`}
          description={`This will permanently delete the account for ${pendingDeleteAdmin.email}. This action cannot be undone.`}
          confirmationText={pendingDeleteAdmin.name}
          onClose={() => setPendingDeleteId(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </>
  );
}
