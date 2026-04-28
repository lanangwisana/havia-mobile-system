// =============================================================
// PERMISSION HELPER
// Menerjemahkan raw permissions dari Brain ke boolean per modul
// =============================================================
// Aturan dari Lanang:
// - Semua role KECUALI OB → bisa akses semua menu
// - OB → hanya Events + Presensi
// - Finance tab-level: Super Admin = semua, PM = Project Summary + Salary, sisanya = Salary saja
// =============================================================

interface UserData {
  is_admin?: string | number;
  user_type?: string;
  permissions?: Record<string, any>;
  job_title?: string;
}

/**
 * Cek apakah user adalah admin (bypass semua permission)
 */
export function isAdmin(user: UserData | null): boolean {
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

/**
 * Cek apakah role user adalah OB (satu-satunya yang di-restrict)
 * OB dideteksi via permission `do_not_show_projects` == "1"
 */
function isOBRole(user: UserData | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return false;
  return getPerm(user, "do_not_show_projects") === "1";
}

// =============================================================
// MODULE ACCESS CHECKERS
// =============================================================

/**
 * Projects & Tasks — semua role kecuali OB
 */
export function canAccessProjects(user: UserData | null): boolean {
  if (!user) return false;
  return !isOBRole(user);
}

/**
 * Finance — semua user bisa akses (termasuk OB untuk lihat gaji sendiri)
 * (Tab-level access dikontrol di FinanceContent: OB & role biasa hanya lihat Salary)
 */
export function canAccessFinance(user: UserData | null): boolean {
  if (!user) return false;
  return true;
}

/**
 * Team — semua role kecuali OB
 */
export function canAccessTeam(user: UserData | null): boolean {
  if (!user) return false;
  return !isOBRole(user);
}

/**
 * Events/Schedule — selalu tampil untuk semua user termasuk OB
 */
export function canAccessEvents(user: UserData | null): boolean {
  if (!user) return false;
  return true;
}

// =============================================================
// FINANCE TAB-LEVEL ACCESS
// =============================================================

/**
 * Cek apakah user bisa lihat Project Summary di Finance
 * - Super Admin: YES
 * - Projek Manager (PM): YES (semua project)
 * - Role lain: NO (hanya salary)
 */
export function canSeeProjectSummary(user: UserData | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  
  const expensePerm = getPerm(user, "expense");
  const canManageAllProjects = getPerm(user, "can_manage_all_projects");
  
  // PM detected if they have 'all' access to expenses OR can_manage_all_projects
  // Or if they have ANY expense permission (usually PM/Admin only)
  return expensePerm === "all" || expensePerm === "1" || canManageAllProjects === "1";
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
 * Aturan: Semua role bisa semua menu, KECUALI OB hanya Events
 */
export function getVisibleMenuItems(user: UserData | null, allItems: QuickMenuItem[]): QuickMenuItem[] {
  if (!user) return [];

  const accessMap: Record<string, (u: UserData | null) => boolean> = {
    'All Tasks': canAccessProjects,
    'Project': canAccessProjects,
    'Events': canAccessEvents,
    'Team': canAccessTeam,
    'Finance': canAccessFinance,
  };

  return allItems.filter(item => {
    const checker = accessMap[item.id];
    if (!checker) return true;
    return checker(user);
  });
}
