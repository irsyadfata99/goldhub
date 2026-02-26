"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenData, setTokenData] = useState<{ agency_id: string; email: string | null } | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validate token on load
  useEffect(() => {
    async function validateToken() {
      const supabase = createClient();

      const { data, error } = await supabase.from("invitation_tokens").select("agency_id, email, used, expires_at").eq("token", token).single();

      if (error || !data) {
        setError("Link undangan tidak valid atau sudah tidak berlaku.");
        setLoading(false);
        return;
      }

      if (data.used) {
        setError("Link undangan ini sudah digunakan.");
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError("Link undangan ini sudah kedaluwarsa.");
        setLoading(false);
        return;
      }

      setTokenData({ agency_id: data.agency_id, email: data.email });
      if (data.email) {
        setForm((f) => ({ ...f, email: data.email! }));
      }
      setLoading(false);
    }

    validateToken();
  }, [token]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Kata sandi tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (!tokenData) return;

    setSubmitting(true);

    try {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!authData.user) {
        setError("Gagal membuat akun. Silakan coba lagi.");
        return;
      }

      // 2. Create user profile
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: form.email,
        role: "client",
        agency_id: tokenData.agency_id,
        status: "active",
      });

      if (userError) {
        setError("Gagal menyimpan profil. Silakan coba lagi.");
        return;
      }

      // 3. Mark token as used
      await supabase.from("invitation_tokens").update({ used: true }).eq("token", token);

      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span>🪙</span> GoldHub
          </div>
          <p className="auth-subtitle">Memvalidasi undangan…</p>
        </div>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span>🪙</span> GoldHub
          </div>
          <div className="alert alert-error">⚠️ {error}</div>
          <Link href="/login" className="btn btn-secondary" style={{ display: "flex", marginTop: "8px" }}>
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span>🪙</span> GoldHub
          </div>
          <div className="alert alert-success">✅ Akun berhasil dibuat! Silakan cek email untuk verifikasi, lalu login.</div>
          <Link href="/login" className="btn btn-primary" style={{ display: "flex", marginTop: "8px" }}>
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>🪙</span> GoldHub
        </div>

        <h1 className="auth-title">Buat Akun Anda</h1>
        <p className="auth-subtitle">Anda diundang untuk bergabung sebagai klien</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Nama Lengkap</label>
            <input id="fullName" name="fullName" type="text" required value={form.fullName} onChange={handleChange} placeholder="Nama lengkap Anda" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="email@anda.com" readOnly={!!tokenData?.email} />
            {tokenData?.email && <p className="form-hint">Email sudah ditentukan oleh agensi.</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Minimal 8 karakter" autoComplete="new-password" />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} placeholder="Ulangi kata sandi" autoComplete="new-password" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Membuat akun…" : "Buat Akun"}
          </button>
        </form>
      </div>
    </div>
  );
}
