import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, BookOpen, Award, FileText, Library,
  MessageSquare, Settings, ChevronLeft, ChevronRight,
  Bell, LogOut, Menu, X, GraduationCap, ClipboardCheck,
  BarChart3, User, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { label: "Modules", icon: BookOpen, page: "Modules" },
  { label: "Case Studies", icon: FileText, page: "CaseStudies" },
  { label: "Skills Checklists", icon: ClipboardCheck, page: "SkillsChecklists" },
  { label: "Resource Library", icon: Library, page: "ResourceLibrary" },
  { label: "Discussions", icon: MessageSquare, page: "Discussions" },
  { label: "My Progress", icon: BarChart3, page: "Progress" },
  { label: "Certificates", icon: Award, page: "Certificates" },
];

const ADMIN_ITEMS = [
  { label: "Admin Panel", icon: Shield, page: "AdminPanel" },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const fullscreenPages = ["Login"];
  if (fullscreenPages.includes(currentPageName)) {
    return children;
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-slate-900 text-white z-40 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-wide whitespace-nowrap">WoundCare</span>
                <span className="text-[10px] text-teal-400 tracking-widest uppercase">Academy</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                  isActive
                    ? "bg-teal-500/15 text-teal-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-teal-400" : ""}`} />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-smooth"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="w-72 h-full bg-slate-900 text-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">WoundCare</span>
                  <span className="text-[10px] text-teal-400 tracking-widest uppercase">Academy</span>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                      isActive
                        ? "bg-teal-500/15 text-teal-400"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {currentPageName === "Dashboard" ? `Welcome back${user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}` : 
                 navItems.find(n => n.page === currentPageName)?.label || currentPageName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-smooth">
                  <Avatar className="w-8 h-8 bg-slate-900">
                    <AvatarFallback className="bg-slate-900 text-white text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  {user?.full_name && (
                    <span className="hidden md:block text-sm font-medium text-slate-700">{user.full_name}</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Progress")} className="flex items-center gap-2">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Certificates")} className="flex items-center gap-2">
                    <Award className="w-4 h-4" /> Certificates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}