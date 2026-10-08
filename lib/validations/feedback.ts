import { z } from "zod";

/**
 * Số điện thoại di động và cố định Việt Nam sau khi chuẩn hóa dấu phân cách.
 * - Đầu số quốc gia: 0, +84 hoặc 84 (sau đó bỏ số 0 đầu).
 * - Đầu số nhà mạng hợp lệ: 03x, 05x, 07x, 08x, 09x.
 * - Số di động có 10 chữ số ở dạng trong nước; số cố định có 11 chữ số.
 * Số cố định: 024/028 + 8 chữ số, mã vùng tỉnh khác + 7 chữ số.
 */
const landlineAreaCodes =
  "203|204|205|206|207|208|209|210|211|212|213|214|215|216|218|219|220|221|222|225|226|227|228|229|232|233|234|235|236|237|238|239|251|252|254|255|256|257|258|259|260|261|262|263|269|270|271|272|273|274|275|276|277|290|291|292|293|294|296|297|299";
export const VN_PHONE_REGEX = new RegExp(
  `^(?:0|\\+?84)(?:(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-46-9])\\d{7}|(?:24|28)\\d{8}|(?:${landlineAreaCodes})\\d{7})$`,
);

// "Nội dung" phải TRÊN 20 ký tự => tối thiểu 21 ký tự.
export const FEEDBACK_MIN_LENGTH = 21;
export const FEEDBACK_MAX_LENGTH = 1000;

/** Chuẩn hóa Unicode (NFC) và cắt khoảng trắng đầu/cuối trước khi kiểm tra. */
export const normalizeContent = (value: string): string =>
  value.normalize("NFC").trim();

const contentSegmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });

/** Đếm ký tự hiển thị: emoji ghép và chữ có dấu được tính là một ký tự. */
export const countContentChars = (value: string): number =>
  Array.from(contentSegmenter.segment(normalizeContent(value))).length;

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
          (value) => value.length === 0 || countContentChars(value) >= FEEDBACK_MIN_LENGTH,
          { message: "Nội dung góp ý phải trên 20 ký tự." },
        )
        .refine((value) => countContentChars(value) <= FEEDBACK_MAX_LENGTH, {
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
