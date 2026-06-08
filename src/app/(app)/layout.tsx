import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav, AppNavBar } from "@/components/nav/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppNav />
      <div className="flex-1 flex flex-col min-w-0">
        <AppNavBar />
        <main className="flex-1 px-4 py-6 md:px-8 pb-24 md:pb-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
