"use client";

import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-flexliner-black flex flex-col md:flex-row">
      {/* Mobile: hamburger */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded text-white/90 hover:bg-white/10"
          aria-label="תפריט"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg font-bold text-flexliner-red">פלקסליינר – ניהול</span>
        <div className="w-10" />
      </header>

      {/* Sidebar: drawer on mobile (top offset for header), normal on desktop */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed md:relative inset-y-0 right-0 z-50 md:z-auto w-56 flex-shrink-0 pt-16 md:pt-0"
      />

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="סגור תפריט"
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-8 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
