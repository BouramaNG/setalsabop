"use client";
import { useState } from "react";
import AdminPage from "@/components/pages/AdminPage";

export default function AdminLogin() {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        setAuthed(true);
        setErr(false);
      } else {
        setErr(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (authed) return <AdminPage />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #06041A, #0D1B4B)" }}>
      <div className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
            Espace Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B5F8A" }}>SetalSaBOP</p>
        </div>
        <input
          type="password"
          placeholder="Mot de passe"
          value={pwd}
          onChange={e => { setPwd(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && login()}
          className="w-full px-4 py-3 rounded-xl text-white text-sm mb-3 outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${err ? "#EF4444" : "rgba(255,255,255,0.1)"}` }}
        />
        {err && (
          <p className="text-xs text-red-400 mb-3 text-center">Mot de passe incorrect</p>
        )}
        <button onClick={login} disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #F4C842, #E8A020)", color: "#0D0B2B" }}>
          {loading ? "Vérification..." : "Accéder"}
        </button>
      </div>
    </div>
  );
}
