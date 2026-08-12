import { Link, useRouter } from "@tanstack/react-router";
import { MessageCircle, Ticket, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

/** Общая оболочка внутренних экранов: заголовок, нижняя навигация. */
export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold">{title}</h1>
        <button
          onClick={signOut}
          aria-label="Выйти из аккаунта"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <LogOut className="size-4" aria-hidden />
          Выйти
        </button>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-2 border-t border-border bg-card/95 backdrop-blur">
        <Link
          to="/chats"
          activeProps={{ className: "text-primary" }}
          inactiveProps={{ className: "text-muted-foreground" }}
          className="flex flex-col items-center gap-1 py-3 text-xs font-semibold"
        >
          <MessageCircle className="size-6" aria-hidden />
          Чаты
        </Link>
        <Link
          to="/invites"
          activeProps={{ className: "text-primary" }}
          inactiveProps={{ className: "text-muted-foreground" }}
          className="flex flex-col items-center gap-1 py-3 text-xs font-semibold"
        >
          <Ticket className="size-6" aria-hidden />
          Приглашения
        </Link>
      </nav>
    </div>
  );
}
