"use server";

export async function loginWithToken(token: string) {
  try {
    const response = await fetch('https://brain.havia.id/index.php/api/users', {
      method: 'GET',
      headers: {
        'authtoken': token,
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return { success: false, error: 'Gagal memverifikasi token (Akses ditolak oleh server).' };
    }
    
    const parsedRes = await response.json();
    console.log("=== API RESPONSE FROM SERVER ===");
    console.log(parsedRes);
    return { success: true, data: parsedRes.data || parsedRes };
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan koneksi server.' };
  }
}
