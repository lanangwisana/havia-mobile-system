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
  role_title?: string;
  role_id?: string | number;
}

/**
 * Mendapatkan nama role berdasarkan role_id
 */
export function getRoleNameFromId(roleId: string | number | undefined, user?: any): string {
  if (user && (user.is_admin === "1" || user.is_admin === 1)) {
    return 'Super Admin';
  }

  if (!roleId) return '';
  const id = parseInt(String(roleId), 10);
  switch (id) {
    case 6: return 'Projek Manager';
    case 7: return 'HR & Admin Projek';
    case 8: return 'Arsitek Manager';
    case 9: return 'Drafter';
    case 10: return 'Household (OB)';
    case 11: return 'Arsitek';
    case 12: return 'Marketing';
    case 13: return 'Estimator';
    default: return '';
  }
}

/**
 * Helper to safely extract role_id from userData
 */
export function getActualRoleId(user: any): string | number | undefined {
  if (!user) return undefined;
  if (user.role_id) return user.role_id;
  
  if (user.permissions) {
    if (typeof user.permissions === 'string') {
      try {
        const parsed = JSON.parse(user.permissions);
        return parsed.role_id;
      } catch (e) {
        return undefined;
      }
    } else {
      return user.permissions.role_id;
    }
  }
  return undefined;
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
  const roleId = parseInt(String(getActualRoleId(user)), 10);
  return roleId === 10;
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
  return true; // Semua role bisa akses Team / Attendance
}

/**
 * Cek apakah user bisa melihat module Team (sebagai Team, bukan Attendance)
 * - Super Admin (role_id 1 atau title "super admin"): YES
 * - HR & Admin Projek (role_id 7 atau title "hr & admin projek"): YES
 * - Sisanya: NO (akan melihat Attendance)
 */
export function canSeeTeamDashboard(user: UserData | null): boolean {
  if (!user) return false;
  
  const roleId = parseInt(String(getActualRoleId(user)), 10);
  const roleTitle = String(user.role_title || '').trim().toLowerCase();
  
  // Berdasarkan Role ID
  if (roleId === 1) return true; // Super Admin
  if (roleId === 7 || roleId === 2) return true; // HR & Admin Projek
  
  // Super Admin flag di tabel users (karena Super Admin sejati di CRM sering tidak punya role_id)
  if (String(user.is_admin) === "1" || user.is_admin === 1) return true;
  
  // Fallback berdasarkan Role Title
  if (roleTitle === 'super admin' || roleTitle === 'admin' || roleTitle === 'hr & admin projek') return true;
  
  return false;
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
 * - HR & Admin Projek: YES (hanya project yang user buat saja)
 */
export function canSeeProjectSummary(user: UserData | null): boolean {
  if (!user) return false;
  
  const roleId = parseInt(String(getActualRoleId(user)), 10);
  
  // Prioritas utama: Jika dia role yang sangat direstriksi (OB, Drafter, dll), langsung blokir
  const isRestrictedRole = [9, 10, 11, 13].includes(roleId);
  if (isRestrictedRole) return false;

  if (isAdmin(user)) return true;
  const jobTitle = (user.job_title || '').toLowerCase();
  const roleTitle = (user.role_title || user.permissions?.role_title || '').toLowerCase();

  // Role Mapping:
  // 6: Projek Manager
  // 7: HR & Admin Projek
  // 8: Arsitek Manager
  // 9: Drafter
  // 10: Household (OB)
  // 11: Arsitek
  // 12: Marketing
  // 13: Estimator

  // Full Access Roles (bisa lihat)
  const isHRAdmin = roleId === 7 || jobTitle.includes('hr & admin') || roleTitle.includes('hr & admin');
  if (isHRAdmin) return true;

  // Partial Access Roles (bisa lihat project summary)
  const isMarketing = roleId === 12 || jobTitle.includes('marketing') || roleTitle.includes('marketing');
  const isPM = roleId === 6 || jobTitle.includes('projek manager') || roleTitle.includes('projek manager') || jobTitle.includes('pm') || roleTitle.includes('pm');
  const isArsitekMgr = roleId === 8 || jobTitle.includes('arsitek manager') || roleTitle.includes('arsitek manager');
  
  if (isMarketing || isPM || isArsitekMgr) return true;

  const restrictedKeywords = ['household', 'ob', 'office boy', 'drafter', 'estimator', 'arsitek'];
  
  if (restrictedKeywords.some(kw => jobTitle.includes(kw) || roleTitle.includes(kw))) {
    return false;
  }
  
  // Default: Sisanya boleh lihat
  return true;
}

// =============================================================
// QUICK ACCESS MENU FILTER
// =============================================================

interface QuickMenuItem {
  id: string;
  label: string;
  icon: any;
  nav?: string;
  route?: string;
}

/**
 * Filter menu Quick Access di Dashboard berdasarkan permission user
 * Aturan: Semua role bisa semua menu, KECUALI OB hanya Events
 */
export function getVisibleMenuItems(user: UserData | null, allItems: QuickMenuItem[]): QuickMenuItem[] {
  if (!user) return [];

  const accessMap: Record<string, (u: UserData | null) => boolean> = {
    'All Tasks': canAccessProjects,
    'My Tasks': canAccessProjects,
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
