"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RegisterAgencyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    agencyName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

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

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.ownerName },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Email ini sudah terdaftar. Silakan gunakan email lain.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setError("Gagal membuat akun. Silakan coba lagi.");
        return;
      }

      // 2. Create agency (status: pending)
      const { data: agencyData, error: agencyError } = await supabase
        .from("agencies")
        .insert({
          name: form.agencyName,
          owner_id: authData.user.id,
          plan: "starter",
          status: "pending",
        })
        .select("id")
        .single();

      if (agencyError || !agencyData) {
        setError("Gagal membuat agensi. Silakan coba lagi.");
        return;
      }

      // 3. Create user profile (status: pending)
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: form.email,
        role: "agency_admin",
        agency_id: agencyData.id,
        status: "pending",
      });

      if (userError) {
        setError("Gagal menyimpan profil. Silakan coba lagi.");
        return;
      }

      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span>🪙</span> GoldHub
          </div>
          <div className="alert alert-success">✅ Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi. Akun Anda akan aktif setelah disetujui oleh tim GoldHub.</div>
          <Link href="/login" className="btn btn-primary" style={{ display: "flex", marginTop: "8px" }}>
            Kembali ke Login
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

        <h1 className="auth-title">Daftarkan Agensi Anda</h1>
        <p className="auth-subtitle">Bergabunglah dengan GoldHub untuk mengelola bisnis emas Anda</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="agencyName">Nama Agensi</label>
            <input id="agencyName" name="agencyName" type="text" required value={form.agencyName} onChange={handleChange} placeholder="PT. Emas Nusantara" />
          </div>

          <div className="form-group">
            <label htmlFor="ownerName">Nama Lengkap Pemilik</label>
            <input id="ownerName" name="ownerName" type="text" required value={form.ownerName} onChange={handleChange} placeholder="Budi Santoso" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="budi@emasanda.com" autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Nomor Telepon</label>
            <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="08123456789" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Minimal 8 karakter" autoComplete="new-password" />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} placeholder="Ulangi kata sandi" autoComplete="new-password" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Mendaftar…" : "Daftar Sekarang"}
          </button>
        </form>

        <hr className="divider" />

        <p className="text-sm text-center">
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
