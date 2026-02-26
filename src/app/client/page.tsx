// ============================================================
// FILE 1: src/app/super-admin/page.tsx
// ============================================================
"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

// ============================================================
// FILE 2: src/app/agency/page.tsx
// ============================================================
// "use client";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";
//
// export default function AgencyPage() {
//   const router = useRouter();
//
//   async function handleLogout() {
//     const supabase = createClient();
//     await supabase.auth.signOut();
//     router.push("/login");
//     router.refresh();
//   }
//
//   return (
//     <div className="dashboard-page">
//       <nav className="dashboard-nav">
//         <div className="dashboard-logo">🪙 GoldHub</div>
//         <div className="dashboard-nav-right">
//           <span className="badge badge-agency">Agency Admin</span>
//           <button onClick={handleLogout} className="btn btn-ghost btn-sm">Keluar</button>
//         </div>
//       </nav>
//       <div className="dashboard-body">
//         <h1 className="dashboard-title">Agency Dashboard</h1>
//         <p className="dashboard-subtitle">Kelola agensi emas Anda di sini.</p>
//       </div>
//     </div>
//   );
// }

// ============================================================
// FILE 3: src/app/client/page.tsx
// ============================================================
// "use client";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";
//
// export default function ClientPage() {
//   const router = useRouter();
//
//   async function handleLogout() {
//     const supabase = createClient();
//     await supabase.auth.signOut();
//     router.push("/login");
//     router.refresh();
//   }
//
//   return (
//     <div className="dashboard-page">
//       <nav className="dashboard-nav">
//         <div className="dashboard-logo">🪙 GoldHub</div>
//         <div className="dashboard-nav-right">
//           <span className="badge badge-client">Client</span>
//           <button onClick={handleLogout} className="btn btn-ghost btn-sm">Keluar</button>
//         </div>
//       </nav>
//       <div className="dashboard-body">
//         <h1 className="dashboard-title">Client Portal</h1>
//         <p className="dashboard-subtitle">Pantau tabungan dan pembelian emas Anda.</p>
//       </div>
//     </div>
//   );
// }
