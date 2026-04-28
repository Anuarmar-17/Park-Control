"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar }  from "./Topbar";
import type { NavSection } from "./Sidebar";

interface DashboardLayoutProps {
  role:         string;
  userName:     string;
  userInitials: string;
  userSub:      string;
  sections:     NavSection[];
  activeId:     string;
  topbarTitle:  string;
  topbarSub:    string;
  onNavigate:   (id: string) => void;
  onLogout:     () => void;
  children:     React.ReactNode;
}

export function DashboardLayout({
  role, userName, userInitials, userSub,
  sections, activeId,
  topbarTitle, topbarSub,
  onNavigate, onLogout,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        role={role}
        userName={userName}
        userInitials={userInitials}
        userSub={userSub}
        sections={sections}
        activeId={activeId}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main wrap — has margin-left: 250px via .main-wrap class */}
      <div className="main-wrap">
        <Topbar
          title={topbarTitle}
          subtitle={topbarSub}
          onMenuToggle={() => setSidebarOpen((p) => !p)}
        />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
