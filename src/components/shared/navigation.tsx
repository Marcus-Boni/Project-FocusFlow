"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { supabase } from "@/lib/supabase";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Brain,
  Home,
  Timer,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  User,
  History,
  Target,
  Newspaper,
  Goal,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Study Timer",
    href: "/dashboard/timer",
    icon: Timer,
  },
  {
    name: "Goals",
    href: "/dashboard/goals",
    icon: Goal,
  },
  {
    name: "Study Areas",
    href: "/dashboard/study-areas",
    icon: BookOpen,
  },
  {
    name: "Spaced Repetition",
    href: "/dashboard/spaced-repetition",
    icon: Target,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    name: "Tech News",
    href: "/dashboard/news",
    icon: Newspaper,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, clearUser } = useUserStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearUser();
  };

  return (
    <div className="w-64 bg-card border-r h-screen fixed left-0 top-0 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => router.push("/das")}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">FocusFlow</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>FocusFlow - Rastreador de Estudos</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Sign Out - Fixed at bottom */}
      <div className="p-4 border-t flex-shrink-0 bg-card">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-3 mb-3 cursor-help">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || user?.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="text-center">
              <p className="font-medium">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs opacity-80 mt-1">{user?.email}</p>
              {user?.user_metadata?.full_name && (
                <p className="text-xs opacity-60 mt-1">
                  Clique no botão abaixo para sair
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Sair da sua conta</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
