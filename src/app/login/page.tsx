"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email atau kata sandi tidak sesuai. Silakan coba lagi.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Gagal masuk. Silakan coba lagi.");
        return;
      }

      const { data: userData } = await supabase.from("users").select("role, status").eq("id", user.id).single();

      if (!userData) {
        setError("Profil Anda tidak ditemukan.");
        return;
      }

      if (userData.status === "pending") {
        await supabase.auth.signOut();
        setError("Akun Anda sedang menunggu persetujuan dari GoldHub.");
        return;
      }

      if (userData.status === "inactive") {
        await supabase.auth.signOut();
        setError("Akun Anda telah dinonaktifkan. Hubungi dukungan kami.");
        return;
      }

      const redirectMap: Record<string, string> = {
        super_admin: "/super-admin",
        agency_admin: "/agency",
        client: "/client",
      };

      router.push(redirectMap[userData.role] ?? "/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>🪙</span> GoldHub
        </div>

        <h1 className="auth-title">Selamat Datang</h1>
        <p className="auth-subtitle">Masuk ke akun Anda untuk melanjutkan</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@email.com" autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi Anda"
                autoComplete="current-password"
                style={{ paddingRight: "52px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "var(--text-muted)",
                  fontSize: "20px",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sedang masuk…" : "Masuk"}
          </button>
        </form>

        <hr className="divider" />

        <p className="text-sm text-center">
          Ingin mendaftarkan agensi emas Anda? <Link href="/register/agency">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
