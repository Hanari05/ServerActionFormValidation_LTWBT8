"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerAction } from "@/app/actions/auth";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export function RegisterForm() {
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(undefined);
    const result = await registerAction(values);

    for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
      if (field in values && messages[0]) {
        setError(field as keyof RegisterInput, { type: "server", message: messages[0] });
      }
    }

    setFormError(result.formError);
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormAlert message={formError} />

      <div className="field-group">
        <label htmlFor="username">Tên người dùng</label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="HanaPro123"
          aria-invalid={Boolean(errors.username)}
          aria-describedby={errors.username ? "username-error" : "username-hint"}
          {...register("username")}
        />
        <p id="username-hint" className="field-hint">3–30 ký tự; chỉ chữ, số và dấu gạch dưới.</p>
        {errors.username && <p id="username-error" className="field-error">{errors.username.message}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="YourEmail@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && <p id="register-email-error" className="field-error">{errors.email.message}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="register-password">Mật khẩu</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Mật khẩu"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "register-password-error" : "password-hint"}
          {...register("password")}
        />
        <p id="password-hint" className="field-hint">Từ 8 đến 72 ký tự.</p>
        {errors.password && <p id="register-password-error" className="field-error">{errors.password.message}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="confirm-password">Nhập lại mật khẩu</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="field-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      <SubmitButton isPending={isSubmitting} pendingLabel="Đang đăng ký…">
        Đăng ký
      </SubmitButton>
    </form>
  );
}
