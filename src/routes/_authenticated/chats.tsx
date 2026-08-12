import { createFileRoute } from "@tanstack/react-router";
import { Bot, MessageCircleHeart } from "lucide-react";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/chats")({
  component: ChatsPage,
});

function ChatsPage() {
  return (
    <AppShell title="Чаты">
      <div className="mx-auto max-w-md space-y-3">
        <div className="card-soft flex items-center gap-3 p-4 opacity-70">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Bot className="size-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-semibold">Эхо-бот</p>
            <p className="truncate text-sm text-muted-foreground">
              Появится на следующем этапе — проверим отправку сообщений
            </p>
          </div>
        </div>

        <div className="card-soft flex flex-col items-center gap-2 px-5 py-10 text-center">
          <MessageCircleHeart className="size-8 text-primary" aria-hidden />
          <p className="font-semibold">Пока здесь тихо</p>
          <p className="text-sm text-muted-foreground">
            Переписка появится на следующем шаге. А пока пригласите близких — им понадобится код из
            раздела «Приглашения».
          </p>
        </div>
      </div>
    </AppShell>
  );
}
