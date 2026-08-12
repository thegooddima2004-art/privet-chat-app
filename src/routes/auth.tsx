import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { CodeInput } from "@/components/CodeInput";
import { supabase } from "@/integrations/supabase/client";
import { registerWithInvite } from "@/lib/invites.functions";

type Mode = "login" | "register";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => ({
    mode: search.mode === "register" ? "register" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Вход и регистрация — Круг" },
      {
        name: "description",
        content: "Войдите в аккаунт или зарегистрируйтесь по 6-значному коду приглашения.",
      },
      { property: "og:title", content: "Вход и регистрация — Круг" },
      { property: "og:description", content: "Регистрация только по коду приглашения." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const register = useServerFn(registerWithInvite);

  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  const inputClass =
    "h-14 w-full rounded-2xl border border-input bg-card px-4 text-base outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-primary)_16%,transparent)]";

  const handleLogin = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error("Не удалось войти. Проверьте e-mail и пароль.");
      return;
    }
    navigate({ to: "/chats" });
  };

  const handleRegister = async () => {
    if (code.length !== 6) {
      toast.error("Введите 6 цифр кода приглашения");
      return;
    }
    if (displayName.trim().length < 2) {
      toast.error("Введите ваше имя");
      return;
    }
    if (password.length < 8) {
      toast.error("Пароль должен быть не короче 8 символов");
      return;
    }

    setBusy(true);
    try {
      const result = await register({
        data: { code, email: email.trim(), password, displayName: displayName.trim() },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        toast.success("Аккаунт создан. Войдите с вашим e-mail и паролем.");
        navigate({ to: "/auth", search: { mode: "login" } });
        return;
      }
      toast.success("Добро пожаловать в Круг!");
      navigate({ to: "/chats" });
    } catch {
      toast.error("Что-то пошло не так. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-surface flex min-h-screen flex-col px-5 py-6">
      <Link
        to="/"
        className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Назад
      </Link>

      <div className="mx-auto mt-6 w-full max-w-md">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
          {(["login", "register"] as const).map((item) => (
            <Link
              key={item}
              to="/auth"
              search={{ mode: item }}
              className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                mode === item ? "bg-card text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground"
              }`}
            >
              {item === "login" ? "Вход" : "По приглашению"}
            </Link>
          ))}
        </div>

        <div className="card-soft mt-5 space-y-4 p-5">
          {mode === "register" && (
            <>
              <div>
                <p className="text-center text-base font-bold">Введите код приглашения</p>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                  6 цифр от того, кто вас пригласил
                </p>
              </div>
              <CodeInput value={code} onChange={setCode} disabled={busy} />

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Как вас зовут</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Например, Дима"
                  maxLength={40}
                  className={inputClass}
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Электронная почта</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="pochta@example.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Пароль</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Минимум 8 символов"
              className={inputClass}
            />
          </label>

          <button
            onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={busy}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>

          {mode === "register" && (
            <p className="text-center text-xs text-muted-foreground">
              Код действует 24 часа и подходит только для одного человека.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
