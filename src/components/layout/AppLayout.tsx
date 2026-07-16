import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarDays, LayoutDashboard, LogOut, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage, useAuth } from "../../contexts/AuthContext";
import { companyLogoUrl } from "../../lib/branding";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/timesheet", label: "Timesheet", icon: CalendarDays },
  { to: "/projects", label: "Projects", icon: Users },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/leaves", label: "Leaves", icon: CalendarDays },
  { to: "/holidays", label: "Holidays", icon: CalendarDays },
  { to: "/assistant", label: "Assistant", icon: MessageSquare },
];

export function AppLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const userName = user ? `${user.first_name} ${user.last_name}` : "TeamFlow User";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white px-4 py-6 md:block">
        <div className="px-3">
          <div className="rounded-md bg-[#010510] px-3 py-2">
            <img alt="Ingenero" className="h-8 w-auto" src={companyLogoUrl} />
          </div>
          <h1 className="mt-4 text-xl font-semibold">TeamFlow</h1>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-[#f5821f] text-white" : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-h-screen bg-white md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f5821f] text-sm font-semibold text-white">
              {initials}
            </div>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
