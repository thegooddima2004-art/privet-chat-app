import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Share2, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/invites")({
  component: InvitesPage,
});

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InvitesPage() {
  const queryClient = useQueryClient();
  const [freshCode, setFreshCode] = useState<string | null>(null);

  const invites = useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invites")
        .select("id, used_at, expires_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createInvite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("create_invite");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as { code: string; expires_at: string };
    },
    onSuccess: (row) => {
      setFreshCode(row.code);
      void queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message.includes("лимит")
          ? "У вас уже 5 активных приглашений. Дождитесь, пока их используют."
          : "Не удалось создать код. Попробуйте ещё раз.",
      );
    },
  });

  const share = async (code: string) => {
    const text = `Приглашаю тебя в мессенджер «Круг». Код приглашения: ${code} (действует 24 часа).`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // пользователь закрыл меню — просто копируем
      }
    }
    await navigator.clipboard.writeText(text);
    toast.success("Приглашение скопировано");
  };

  return (
    <AppShell title="Приглашения">
      <div className="mx-auto max-w-md space-y-4">
        {freshCode ? (
          <div className="card-soft p-5 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Код приглашения</p>
            <p className="mt-2 text-4xl font-extrabold tracking-[0.35em] text-primary">
              {freshCode}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Действует 24 часа и подходит только для одного человека.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(freshCode);
                  toast.success("Код скопирован");
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card font-semibold hover:bg-muted"
              >
                <Copy className="size-4" aria-hidden />
                Скопировать
              </button>
              <button
                onClick={() => void share(freshCode)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground hover:opacity-90"
              >
                <Share2 className="size-4" aria-hidden />
                Поделиться
              </button>
            </div>
          </div>
        ) : (
          <div className="card-soft flex flex-col items-center gap-2 px-5 py-8 text-center">
            <Ticket className="size-8 text-primary" aria-hidden />
            <p className="font-semibold">Пригласите друга</p>
            <p className="text-sm text-muted-foreground">
              Мы создадим код из 6 цифр — передайте его тому, кого хотите пригласить.
            </p>
          </div>
        )}

        <button
          onClick={() => createInvite.mutate()}
          disabled={createInvite.isPending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {createInvite.isPending && <Loader2 className="size-5 animate-spin" aria-hidden />}
          Создать код приглашения
        </button>

        <div className="space-y-2">
          <p className="px-1 text-sm font-semibold text-muted-foreground">Ваши приглашения</p>
          {invites.isLoading && (
            <p className="px-1 text-sm text-muted-foreground">Загружаем…</p>
          )}
          {invites.data?.length === 0 && (
            <p className="px-1 text-sm text-muted-foreground">Вы ещё никого не приглашали.</p>
          )}
          {invites.data?.map((invite) => {
            const used = Boolean(invite.used_at);
            const expired = !used && new Date(invite.expires_at) < new Date();
            return (
              <div key={invite.id} className="card-soft flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">
                    {used ? "Использовано" : expired ? "Срок истёк" : "Ждёт друга"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {used
                      ? `Приняли ${formatDate(invite.used_at as string)}`
                      : `Действует до ${formatDate(invite.expires_at)}`}
                  </p>
                </div>
                <span
                  className={`size-3 rounded-full ${
                    used ? "bg-primary" : expired ? "bg-muted-foreground" : "bg-accent"
                  }`}
                  aria-hidden
                />
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
