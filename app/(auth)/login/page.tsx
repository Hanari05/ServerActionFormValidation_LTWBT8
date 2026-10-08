import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <>
      <div className="auth-heading">
        <h1 id="auth-title">Đăng nhập</h1>
      </div>

      <LoginForm />

      <p className="auth-switch">
        Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
      </p>
      <p className="auth-switch">
        <Link href="/feedback">Góp ý khách hàng</Link>
      </p>
    </>
  );
}
