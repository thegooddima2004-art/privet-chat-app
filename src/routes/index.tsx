import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircleHeart, ShieldCheck, Mic } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Круг — мессенджер для своих" },
      {
        name: "description",
        content:
          "Простой мессенджер по приглашениям: переписка, голосовые сообщения и встроенный бот для проверки.",
      },
      { property: "og:title", content: "Круг — мессенджер для своих" },
      {
        property: "og:description",
        content: "Вход только по 6-значному коду приглашения. Просто, спокойно, без лишнего.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const features = [
  { icon: ShieldCheck, title: "Только по приглашению", text: "Здесь нет случайных людей." },
  { icon: MessageCircleHeart, title: "Сообщения сразу", text: "Пишите и получайте мгновенно." },
  { icon: Mic, title: "Голосовые", text: "Удерживайте кнопку и говорите." },
];

function Welcome() {
  return (
    <div className="app-surface flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[var(--shadow-raised)]">
          <MessageCircleHeart className="size-8" aria-hidden />
        </div>

        <h1 className="mt-6 text-4xl font-extrabold">Круг</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Спокойный мессенджер для близких и друзей. Попасть внутрь можно только по коду
          приглашения.
        </p>

        <div className="mt-8 space-y-3 text-left">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-soft flex items-start gap-3 p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity hover:opacity-90"
          >
            У меня есть код приглашения
          </Link>
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="flex h-14 w-full items-center justify-center rounded-2xl border border-border bg-card text-base font-semibold transition-colors hover:bg-muted"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    </div>
  );
}
