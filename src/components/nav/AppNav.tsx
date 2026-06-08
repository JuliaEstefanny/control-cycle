"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  PlusCircle,
  BookOpen,
  User,
  List,
  Share2,
  Mail,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/anotacao/calendario", label: "Anotar", icon: PlusCircle },
  { href: "/ciclos", label: "Ciclos", icon: List },
  { href: "/compartilhamentos", label: "Compartilhar", icon: Share2 },
  { href: "/perfil", label: "Perfil", icon: User },
];

const sidebarItems = [
  ...navItems.slice(0, 3),
  { href: "/compartilhamentos", label: "Compartilhamentos", icon: Share2 },
  ...navItems.slice(3),
  { href: "/fale-conosco", label: "Fale conosco", icon: Mail },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 h-screen sticky top-0 bg-white border-r border-gray-100 px-3 py-6 gap-1 overflow-y-auto">
        <div className="px-3 mb-6">
          <span className="text-xl font-bold text-rose-600">Control Cycle</span>
        </div>

        {sidebarItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && href !== "/anotacao/calendario" && pathname.startsWith(href)) || (href === "/anotacao/calendario" && pathname.startsWith("/anotacao"));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-rose-50 text-rose-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 w-full transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Barra inferior mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && href !== "/anotacao/calendario" && pathname.startsWith(href)) || (href === "/anotacao/calendario" && pathname.startsWith("/anotacao"));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                  active ? "text-rose-500" : "text-gray-400"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function AppNavBar() {
  return (
    <header className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <span className="text-lg font-bold text-rose-600">Control Cycle</span>
    </header>
  );
}
