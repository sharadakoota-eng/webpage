"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type PortalLogoutButtonProps = {
  className?: string;
  compact?: boolean;
};

export function PortalLogoutButton({ className, compact = false }: PortalLogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
    >
      <LogOut className={compact ? "h-4 w-4" : "h-4 w-4"} />
      <span>{compact ? "Logout" : "Logout"}</span>
    </button>
  );
}
