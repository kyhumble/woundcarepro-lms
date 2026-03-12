import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, BookOpen, Award, FileText, Library,
  MessageSquare, Settings, ChevronLeft, ChevronRight,
  Bell, LogOut, Menu, X, GraduationCap, ClipboardCheck,
  BarChart3, User, Shield, Trophy, Calendar, CheckCheck,
  Search, CreditCard, Sparkles
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import moment from "moment";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Learning Paths", icon: BookOpen, page: "LearningPaths" },
      { label: "Modules", icon: GraduationCap, page: "Modules" },
      { label: "Mock Exams", icon: FileText, page: "MockExams" },
      { label: "Study Planner", icon: Calendar, page: "StudyPlanner" },
    ],
  },
  {
    label: "Practice",
    items: [
      { label: "Case Studies", icon: FileText, page: "CaseStudies" },
      { label: "Skills Checklists", icon: ClipboardCheck, page: "SkillsChecklists" },
      { label: "Resource Library", icon: Library, page: "ResourceLibrary" },
      { label: "Discussions", icon: MessageSquare, page: "Discussions" },
    ],
  },
  {
    label: "My Progress",
    items: [
      { label: "Skill Mastery", icon: Trophy, page: "SkillMastery" },
      { label: "Leaderboard", icon: Trophy, page: "Leaderboard" },
      { label: "My Portfolio", icon: BarChart3, page: "Portfolio" },
      { label: "Progress", icon: BarChart3, page: "Progress" },
      { label: "Certificates", icon: Award, page: "Certificates" },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const ADMIN_ITEMS = [
  { label: "Admin Panel", icon: Shield, page: "AdminPanel" },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [tabHistory, setTabHistory] = useState(() => {
    const saved = localStorage.getItem('tab_history');
    return saved ? JSON.parse(saved) : {};
  });
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 20),
    enabled: !!user?.email,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true, read_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        base44.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "achievement": return "🏆";
      case "success": return "✅";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  useEffect(() => {
    localStorage.setItem('tab_history', JSON.stringify(tabHistory));
  }, [tabHistory]);

  useEffect(() => {
    setTabHistory(prev => ({
      ...prev,
      [currentPageName]: location.pathname + location.search
    }));
  }, [currentPageName, location]);

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
                <span className="font-semibold text-sm tracking-wide whitespace-nowrap">Healing Compass</span>
                <span className="text-[10px] text-teal-400 tracking-widest uppercase">Academy</span>
                <span className="text-[9px] text-slate-400 mt-0.5 whitespace-nowrap">Total Wound Care</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-1">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                        isActive
                          ? "bg-teal-500/15 text-teal-400"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-teal-400" : ""}`} />
                      {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {isAdmin && (
            <div>
              {sidebarOpen && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-1">
                  Admin
                </p>
              )}
              <div className="space-y-0.5">
                {ADMIN_ITEMS.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                        isActive
                          ? "bg-teal-500/15 text-teal-400"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-teal-400" : ""}`} />
                      {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
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
                  <span className="font-semibold text-sm">Healing Compass</span>
                  <span className="text-[10px] text-teal-400 tracking-widest uppercase">Academy</span>
                  <span className="text-[9px] text-slate-400">Total Wound Care</span>
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
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
            {/* Search Button */}
            <Link
              to={createPageUrl("Search")}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search...</span>
              <kbd className="hidden md:inline text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-400">⌘K</kbd>
            </Link>
            <Link
              to={createPageUrl("Search")}
              className="sm:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="border-b px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="h-7 text-xs gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.is_read ? "bg-teal-50/30" : ""
                        }`}
                        onClick={() => {
                          if (!notif.is_read) markAsReadMutation.mutate(notif.id);
                          if (notif.link) {
                            setNotificationOpen(false);
                            window.location.href = notif.link;
                          }
                        }}
                      >
                        <div className="flex gap-2">
                          <span className="text-lg flex-shrink-0">{getNotificationIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 line-clamp-1">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {moment(notif.created_date).fromNow()}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Bell className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                      <p className="text-sm text-slate-400">No notifications yet</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Settings")} className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Search")} className="flex items-center gap-2">
                    <Search className="w-4 h-4" /> Search
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Pricing")} className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Pricing & Plans
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
        <main className="p-4 lg:p-8 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPageName}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-bottom">
          <div className="flex items-center justify-around h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {[
              { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
              { label: "Paths", icon: BookOpen, page: "LearningPaths" },
              { label: "Exams", icon: GraduationCap, page: "MockExams" },
              { label: "Library", icon: Library, page: "ResourceLibrary" }
            ].map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 transition-smooth ${
                    isActive ? "text-teal-600" : "text-slate-500"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        </div>
        </div>
        );
        }