import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackForm } from "@/components/forms/FeedbackForm";

export const metadata: Metadata = { title: "Góp ý khách hàng" };

export default function FeedbackPage() {
  return (
    <>
      <div className="auth-heading">
        <p className="eyebrow">Chúng tôi luôn lắng nghe</p>
        <h1 id="auth-title">Góp ý khách hàng</h1>
        <p>Gửi góp ý và số điện thoại để chúng tôi có thể liên hệ lại.</p>
      </div>

      <FeedbackForm />

      <p className="auth-switch">
        <Link href="/login">Quay lại đăng nhập</Link>
      </p>
    </>
  );
}
