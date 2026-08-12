import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Код состоит из 6 цифр");

/** Проверка кода без погашения — для формы регистрации. */
export const checkInvite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ code: codeSchema }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: valid } = await supabaseAdmin.rpc("is_invite_valid", { _code: data.code });
    return { valid: valid === true };
  });

const registerSchema = z.object({
  code: codeSchema,
  email: z.string().trim().toLowerCase().email("Некорректный адрес e-mail").max(255),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов").max(72),
  displayName: z.string().trim().min(2, "Слишком короткое имя").max(40),
});

/** Регистрация по одноразовому коду приглашения. */
export const registerWithInvite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => registerSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: valid } = await supabaseAdmin.rpc("is_invite_valid", { _code: data.code });
    if (valid !== true) {
      return { ok: false as const, error: "Код недействителен или истёк" };
    }

    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (created.error || !created.data.user) {
      const message = created.error?.message ?? "";
      return {
        ok: false as const,
        error: /already|exists|registered/i.test(message)
          ? "Этот адрес e-mail уже зарегистрирован"
          : "Не удалось создать аккаунт. Попробуйте ещё раз.",
      };
    }

    const userId = created.data.user.id;

    // Погашение кода атомарно: два человека один код использовать не смогут.
    const consumed = await supabaseAdmin.rpc("consume_invite", {
      _code: data.code,
      _user_id: userId,
    });
    if (consumed.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { ok: false as const, error: "Код уже использован. Попросите новый." };
    }

    const base =
      (data.email.split("@")[0] ?? "user").replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user";
    let username = base;
    for (let i = 0; i < 6; i++) {
      const taken = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (!taken.data) break;
      username = `${base}${Math.floor(Math.random() * 9000) + 1000}`;
    }

    const profile = await supabaseAdmin.from("profiles").insert({
      id: userId,
      display_name: data.displayName,
      username,
      invited_by: (consumed.data as string | null) ?? null,
    });
    if (profile.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { ok: false as const, error: "Не удалось создать профиль. Попробуйте ещё раз." };
    }

    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "user" });

    return { ok: true as const };
  });
