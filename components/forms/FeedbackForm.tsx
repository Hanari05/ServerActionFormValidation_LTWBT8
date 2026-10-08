"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  countContentChars,
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_MIN_LENGTH,
  feedbackSchema,
  type FeedbackInput,
} from "@/lib/validations/feedback";

export function FeedbackForm() {
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { content: "", phone: "" },
  });

  const contentLength = countContentChars(watch("content") ?? "");

  async function onSubmit(values: FeedbackInput) {
    setFormError(undefined);
    setFormSuccess(undefined);

    let result;
    try {
      result = await submitFeedbackAction(values);
    } catch {
      setFormError("Không thể gửi góp ý lúc này. Vui lòng thử lại.");
      return;
    }

    for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
      if (field in values && messages[0]) {
        setError(field as keyof FeedbackInput, {
          type: "server",
          message: messages[0],
        });
      }
    }

    if (result.status === "success") {
      reset();
      setFormSuccess(result.formSuccess);
    }
    setFormError(result.formError);
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit(onSubmit, () => {
      setFormSuccess(undefined);
      setFormError(undefined);
    })} noValidate>
      <FormAlert message={formError} />
      <FormAlert message={formSuccess} variant="success" />

      <div className="field-group">
        <label htmlFor="feedback-content">Nội dung</label>
        <textarea
          id="feedback-content"
          rows={5}
          placeholder={`Nhập góp ý của bạn (trên ${FEEDBACK_MIN_LENGTH - 1} ký tự)…`}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={
            errors.content ? "feedback-content-error" : "feedback-content-hint"
          }
          {...register("content")}
        />
        <p id="feedback-content-hint" className="field-hint">
          Trên {FEEDBACK_MIN_LENGTH - 1} ký tự — hiện có {contentLength}/{FEEDBACK_MAX_LENGTH}.
        </p>
        {errors.content && (
          <p id="feedback-content-error" className="field-error">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="field-group">
        <label htmlFor="feedback-phone">Số điện thoại</label>
        <input
          id="feedback-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0912345678"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={
            errors.phone ? "feedback-phone-error" : "feedback-phone-hint"
          }
          {...register("phone")}
        />
        <p id="feedback-phone-hint" className="field-hint">
          Số di động hoặc điện thoại bàn Việt Nam, ví dụ 0912345678, +84912345678 hoặc 02412345678.
        </p>
        {errors.phone && (
          <p id="feedback-phone-error" className="field-error">
            {errors.phone.message}
          </p>
        )}
      </div>

      <SubmitButton isPending={isSubmitting} pendingLabel="Đang gửi…">
        Gửi góp ý
      </SubmitButton>
    </form>
  );
}
