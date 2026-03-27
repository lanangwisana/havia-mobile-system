"use server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brain.havia.id/index.php/api';

export async function loginWithToken(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'authtoken': token.trim(),
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return { success: false, error: 'Gagal memverifikasi token (Akses ditolak oleh server).' };
    }
    
    const parsedRes = await response.json();
    return { success: true, data: parsedRes.data || parsedRes };
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan koneksi server.' };
  }
}

export async function loginWithEmailPassword(email: string, password: string) {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    console.log(`Mencoba login ke: ${API_BASE_URL}/login dengan email: ${email}`);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData,
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    console.log("=== LOGIN API RESPONSE ===", textRes);

    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: 'Gagal parse JSON dari server.' };
    }
    
    if (!response.ok || parsedRes.success === false) {
      return { success: false, error: parsedRes.message || 'Email atau password salah.' };
    }
    
    return { 
      success: true, 
      data: parsedRes.user, 
      token: parsedRes.token 
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan koneksi server.' };
  }
}

// Fungsi helper untuk membersihkan token secara aman
const sanitizeToken = (token: string) => {
  if (!token) return "";
  // Hanya hapus spasi dan tanda kutip (sering terselip dari localStorage)
  return token.trim().replace(/^["']|["']$/g, '').trim();
};

// In-memory global cache for backup/fallback (persists across hot-reloads in Next.js dev and lambda warm starts)
const globalCache = (globalThis as any).apiBackupCache || new Map();
if (!(globalThis as any).apiBackupCache) {
  (globalThis as any).apiBackupCache = globalCache;
}

// Fungsi Generic untuk fetch endpoint API apa saja dari RISE CRM (CORS safe) dengan Resilience 
export async function fetchFromApi(endpoint: string, token: string, retryCount = 0): Promise<any> {
  const cleanToken = sanitizeToken(token);
  const cacheKey = `${cleanToken.substring(0, 10)}_${endpoint}`;
  
  try {
    let activeToken = cleanToken;
    // STRATEGI RETRY KHUSUS
    if (retryCount === 1) {
      activeToken = " " + activeToken;
    }

    const url = `${API_BASE_URL}/${endpoint}`;
    console.log(`[API] ${endpoint} | Retry: ${retryCount} | TokenHead: ${activeToken.substring(0, 15)}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 detik timeout toleransi

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authtoken': activeToken,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // 404 = Data Kosong (sah dari backend)
    if (response.status === 404) {
      return { success: true, data: [], isEmpty: true };
    }

    const textRes = await response.text();
    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      throw new Error(`JSON Error (${response.status})`);
    }
    
    if (!response.ok) {
      const errorDetail = parsedRes?.messages?.error || parsedRes?.message || parsedRes?.error || `Server Error ${response.status}`;
      
      // AUTO-RETRY KHUSUS UNTUK 401 ATAU INTERNAL ERROR (sebelum fallback cache)
      if ((response.status === 401 || response.status >= 500) && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return fetchFromApi(endpoint, token, retryCount + 1);
      }
      
      throw new Error(errorDetail);
    }
    
    // Sukses mereload data asli! Simpan ke cache sebagai backup
    const finalData = parsedRes.data || parsedRes;
    globalCache.set(cacheKey, { data: finalData, meta: parsedRes.meta, timestamp: Date.now() });
    
    return { success: true, data: finalData, meta: parsedRes.meta };
    
  } catch (error: any) {
    const isNetworkIssue = error.name === 'AbortError' || error.message.toLowerCase().includes('fetch');
    
    // 1. AUTO RETRY jika masalah jaringan lambat atau terputus
    if (retryCount < 2 && isNetworkIssue) {
       console.log(`[API] Timeout/Jaringan lambat pada ${endpoint}, mencoba retry... (${retryCount+1})`);
       await new Promise(resolve => setTimeout(resolve, 1500));
       return fetchFromApi(endpoint, token, retryCount + 1);
    }

    // 2. FALLBACK KE CACHE DATA ASLI (REAL DATA)
    // Jika server down atau internet nge-lag parah, keluarkan data autentik terakhir yang kita miliki!
    if (globalCache.has(cacheKey)) {
       console.log(`[API] RESILIENCE ACTIVATED: Served BACKUP DATA for ${endpoint}`);
       const cached = globalCache.get(cacheKey);
       return { success: true, data: cached.data, meta: cached.meta, isBackup: true };
    }

    // 3. FALLBACK ERROR GRACEFUL (Bukan 'failed to fetch')
    return { 
      success: false, 
      error: 'Peladen (Server) sedang sibuk atau jaringan Anda tidak stabil. Data akan dimuat ulang otomatis.', 
      isOffline: true 
    };
  }
}

// Fungsi Generic untuk POST (create data) ke API RISE CRM
export async function postToApi(endpoint: string, token: string, body: Record<string, any>) {
  try {
    const url = `${API_BASE_URL}/${endpoint}`;
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authtoken': token.trim(),
        'Accept': 'application/json'
      },
      body: formData,
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: `Server Error (${response.status})` };
    }
    
    if (!response.ok) {
      const errorMsg = parsedRes.message || parsedRes.error || parsedRes.messages?.error || 
                       `Error ${response.status}: ${JSON.stringify(parsedRes).substring(0, 100)}`;
      return { success: false, error: errorMsg };
    }
    
    return { success: true, data: parsedRes.data || parsedRes, meta: parsedRes.meta };
  } catch (error: any) {
    return { success: false, error: error.message || 'Kesalahan koneksi.' };
  }
}

// Fungsi Generic untuk PUT (update data) ke API RISE CRM
export async function putToApi(endpoint: string, token: string, body: Record<string, any>) {
  try {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // Gunakan JSON untuk PUT sesuai standar REST Controller Brain
    const response = await fetch(url, {
      method: 'PUT', 
      headers: {
        'authtoken': token.trim(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    if (response.status === 204 || !textRes) {
      return { success: true, message: 'Updated' };
    }

    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: `Status ${response.status}: Response bukan JSON.` };
    }

    if (!response.ok) {
      return { success: false, error: parsedRes.message || parsedRes.error || `Gagal update (${response.status}).` };
    }
    
    return { success: true, data: parsedRes.data || parsedRes, meta: parsedRes.meta };
  } catch (error: any) {
    return { success: false, error: error.message || 'Kesalahan koneksi.' };
  }
}

// Fungsi Generic untuk DELETE data di API RISE CRM
export async function deleteFromApi(endpoint: string, token: string) {
  try {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'authtoken': token.trim(),
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    if (response.status === 204) return { success: true };

    const textRes = await response.text();
    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      if (response.ok) return { success: true };
      return { success: false, error: `Status ${response.status}: Gagal hapus.` };
    }
    
    if (!response.ok) {
      return { success: false, error: parsedRes.message || 'Gagal menghapus data.' };
    }
    
    return { success: true, message: parsedRes.message || 'Berhasil dihapus.' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Kesalahan koneksi.' };
  }
}
// Fungsi khusus untuk upload avatar (karena butuh handling File/FormData di server side)
export async function uploadAvatar(token: string, fileData: FormData) {
  try {
    const url = `${API_BASE_URL}/haviacms/profile/upload_avatar`;
    console.log(`[UploadAvatar] Calling: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authtoken': token.trim(),
        'Accept': 'application/json'
      },
      body: fileData,
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: 'Server Error (Upload): Response bukan JSON.' };
    }
    
    if (!response.ok) {
      return { success: false, error: parsedRes.message || 'Gagal mengunggah foto profil.' };
    }
    
    return { success: true, image: parsedRes.image };
  } catch (error: any) {
    return { success: false, error: error.message || 'Kesalahan koneksi saat upload.' };
  }
}

export async function deleteAvatar(token: string) {
  try {
    const url = `${API_BASE_URL}/haviacms/profile/delete_avatar`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authtoken': token.trim(),
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: 'Server Error (Delete Avatar): Response bukan JSON.' };
    }
    
    if (!response.ok) {
      return { success: false, error: parsedRes.message || 'Gagal menghapus foto profil.' };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Kesalahan koneksi saat menghapus foto.' };
  }
}

export async function verifyUserStatus(token: string) {
  try {
    const url = `${API_BASE_URL}/haviacms/profile/verify_status`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authtoken': token.trim(),
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: 'Server Error: Invalid Response.' };
    }
    
    if (!response.ok) {
      return { 
        success: false, 
        status: parsedRes.status || 'blocked', 
        message: parsedRes.message || 'Akun dinonaktifkan.' 
      };
    }
    
    return { success: true, status: 'active' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memverifikasi status user.' };
  }
}
