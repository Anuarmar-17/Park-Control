"use client";

import React from "react";

export interface NavItem {
  id:     string;
  label:  string;
  icon:   string;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  role:          string;
  userName:      string;
  userInitials:  string;
  userSub:       string;
  sections:      NavSection[];
  activeId:      string;
  onNavigate:    (id: string) => void;
  onLogout:      () => void;
  isOpen:        boolean;
  onClose:       () => void;
}

export function Sidebar({
  role, userName, userInitials, userSub,
  sections, activeId, onNavigate, onLogout,
  isOpen, onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop${isOpen ? " show" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar${isOpen ? " open" : ""}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">🅿</div>
          <span className="logo-text">
            Park<span>Control</span>
          </span>
          <span className="logo-role">{role}</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="nav-section">{section.title}</div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item${activeId === item.id ? " active" : ""}`}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge != null && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-tile">
            <div className="user-avatar">{userInitials}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-sub">{userSub}</div>
            </div>
            <button className="btn-logout-sm" title="Cerrar sesión" onClick={onLogout}>
              ↩
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
