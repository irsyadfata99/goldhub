"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SuperAdminPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-logo">🪙 GoldHub</div>
        <div className="dashboard-nav-right">
          <span className="badge badge-super">Super Admin</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Keluar
          </button>
        </div>
      </nav>
      <div className="dashboard-body">
        <h1 className="dashboard-title">Super Admin Dashboard</h1>
        <p className="dashboard-subtitle">Selamat datang di panel kontrol GoldHub.</p>
      </div>
    </div>
  );
}
