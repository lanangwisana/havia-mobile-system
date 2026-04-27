// =============================================================
// PERMISSION HELPER
// Menerjemahkan raw permissions dari Brain ke boolean per modul
// =============================================================

interface UserData {
  is_admin?: string | number;
  user_type?: string;
  permissions?: Record<string, any>;
}

/**
 * Cek apakah user adalah admin (bypass semua permission)
 */
function isAdmin(user: UserData | null): boolean {
  if (!user) return false;
  return (
    String(user.is_admin) === "1" ||
    user.permissions?._all_access === true
  );
}

/**
 * Ambil value dari permissions object
 */
function getPerm(user: UserData | null, key: string): string {
  if (!user?.permissions) return "";
  const val = user.permissions[key];
  if (val === null || val === undefined || val === false) return "";
  return String(val);
}

// =============================================================
// MODULE ACCESS CHECKERS
// =============================================================

/**
 * Projects & Tasks — hide jika `do_not_show_projects` == "1"
 */
export function canAccessProjects(user: UserData | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return getPerm(user, "do_not_show_projects") !== "1";
}

/**
 * Finance — hide jika permission `expense` kosong
 * (Hanya role dengan akses expense yang bisa lihat Finance)
 */
export function canAccessFinance(user: UserData | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return getPerm(user, "expense") !== "";
}

/**
 * Team (Attendance management, Leave management) — hide jika
 * kedua permission `attendance` DAN `leave` kosong
 */
export function canAccessTeam(user: UserData | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const hasAttendance = getPerm(user, "attendance") !== "";
  const hasLeave = getPerm(user, "leave") !== "";
  return hasAttendance || hasLeave;
}

/**
 * Events/Schedule — selalu tampil untuk semua user
 * (Setiap orang bisa melihat event yang di-share kepadanya)
 */
export function canAccessEvents(user: UserData | null): boolean {
  if (!user) return false;
  // Events always accessible for all logged-in users
  return true;
}

/**
 * Clients — hide jika permission `client` kosong
 */
export function canAccessClients(user: UserData | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return getPerm(user, "client") !== "";
}

// =============================================================
// QUICK ACCESS MENU FILTER
// =============================================================

interface QuickMenuItem {
  id: string;
  label: string;
  icon: any;
  nav?: string;
}

/**
 * Filter menu Quick Access di Dashboard berdasarkan permission user
 */
export function getVisibleMenuItems(user: UserData | null, allItems: QuickMenuItem[]): QuickMenuItem[] {
  if (!user) return [];

  // Mapping: Quick Access ID -> permission checker
  const accessMap: Record<string, (u: UserData | null) => boolean> = {
    'All Tasks': canAccessProjects,  // Tasks terkait projects
    'Project': canAccessProjects,
    'Events': canAccessEvents,
    'Team': canAccessTeam,
    'Finance': canAccessFinance,
  };

  return allItems.filter(item => {
    const checker = accessMap[item.id];
    if (!checker) return true; // Jika tidak ada rule, tampilkan
    return checker(user);
  });
}
