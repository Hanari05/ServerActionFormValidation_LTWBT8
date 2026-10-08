"use server";

import type { FormActionState } from "@/lib/types/forms";
import { insertFeedback } from "@/lib/data/feedback";
import { feedbackSchema } from "@/lib/validations/feedback";

export async function submitFeedbackAction(
  input: unknown,
): Promise<FormActionState> {
  const parsed = feedbackSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await insertFeedback(parsed.data);
  } catch {
    return {
      status: "error",
      formError: "Không thể lưu góp ý lúc này. Vui lòng thử lại.",
    };
  }

  return {
    status: "success",
    formSuccess: "Cảm ơn bạn đã góp ý! Chúng tôi đã nhận được thông tin.",
  };
}
