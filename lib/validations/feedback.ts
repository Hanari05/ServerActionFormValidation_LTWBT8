import { z } from "zod";

/**
 * Số điện thoại di động Việt Nam (đã bỏ dấu cách, dấu chấm, gạch ngang).
 * - Đầu số quốc gia: 0, +84 hoặc 84 (sau đó bỏ số 0 đầu).
 * - Đầu số nhà mạng hợp lệ: 03x, 05x, 07x, 08x, 09x.
 * - Tổng cộng 10 chữ số (dạng 0xxxxxxxxx) hoặc 11 chữ số (dạng 84xxxxxxxxx).
 * Chưa hỗ trợ số điện thoại bàn (02x...).
 */
export const VN_PHONE_REGEX =
  /^(?:0|\+?84)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-46-9])\d{7}$/;

// "Nội dung" phải TRÊN 20 ký tự => tối thiểu 21 ký tự.
export const FEEDBACK_MIN_LENGTH = 21;
export const FEEDBACK_MAX_LENGTH = 1000;

/** Chuẩn hóa Unicode (NFC) và cắt khoảng trắng đầu/cuối trước khi kiểm tra. */
export const normalizeContent = (value: string): string =>
  value.normalize("NFC").trim();

/** Đếm theo ký tự hiển thị (code point), không đếm theo đơn vị UTF-16. */
export const countContentChars = (value: string): number =>
  Array.from(normalizeContent(value)).length;

/** Bỏ dấu cách, dấu chấm, gạch ngang: "0912 345 678" -> "0912345678". */
export const normalizePhone = (value: string): string =>
  value.trim().replace(/[\s.-]/g, "");

export const feedbackSchema = z.object({
  //------------------------------------------------------------------
  content: z
    .string()
    .transform(normalizeContent)
    .pipe(
      z
        .string()
        .min(1, "Vui lòng nhập nội dung góp ý.")
        .refine(
          (value) => value.length === 0 || Array.from(value).length >= FEEDBACK_MIN_LENGTH,
          { message: "Nội dung góp ý phải trên 20 ký tự." },
        )
        .refine((value) => Array.from(value).length <= FEEDBACK_MAX_LENGTH, {
          message: `Nội dung góp ý không được vượt quá ${FEEDBACK_MAX_LENGTH} ký tự.`,
        }),
    ),
  //------------------------------------------------------------------
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(
      z
        .string()
        .min(1, "Vui lòng nhập số điện thoại.")
        .regex(
          VN_PHONE_REGEX,
          "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678 hoặc +84912345678).",
        ),
    ),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
