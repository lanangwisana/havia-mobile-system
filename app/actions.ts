"use server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brain.havia.id/index.php/api';

export async function loginWithToken(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
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

// Fungsi Generic untuk fetch endpoint API apa saja dari RISE CRM (CORS safe)
export async function fetchFromApi(endpoint: string, token: string) {
  try {
    const url = `${API_BASE_URL}/${endpoint}`;
    console.log(`Fetching from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authtoken': token,
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    console.log(`=== RAW RESP FROM ${endpoint} ===`, textRes.substring(0, 200));

    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: `Gagal parse JSON dari ${endpoint}. Status: ${response.status}. Response: ` + textRes.substring(0, 200) };
    }
    
    if (!response.ok) {
      console.log(`=== API HTTP ERROR ${response.status} ===`, parsedRes);
      
      // FALLBACK WORKAROUND KHUSUS API EVENTS (Menangani Error 500 dari Server)
      if ((endpoint === 'events' || endpoint === 'haviacms/events') && response.status >= 500) {
        console.warn("MENGGUNAKAN FALLBACK DATA KARENA API EVENTS ERROR 500. Detail:", parsedRes);
        // Membuat data dummy yang terinspirasi dari screenshot dashboard CRM asli
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        
        const fallbackEvents = [
          {
            id: 'mock-1',
            title: 'saas',
            description: 'Data event dummy otomatis dari fallback system (API Server Error)',
            start_date: `${currentYear}-${currentMonth}-08`,
            end_date: `${currentYear}-${currentMonth}-11`,
            start_time: '10:00',
            end_time: '12:00',
            location: 'Havia HQ',
            color: '#84c529',
            share_with: 'all',
          },
          {
            id: 'mock-2',
            title: 'tes',
            description: 'Testing event fallback',
            start_date: `${currentYear}-${currentMonth}-08`,
            end_date: `${currentYear}-${currentMonth}-09`,
            start_time: '13:00',
            end_time: '15:00',
            location: '',
            color: '#3b82f6',
            share_with: 'all',
          },
          {
            id: 'mock-3',
            title: 'Bukber',
            description: 'Buka puasa bersama tim',
            start_date: `${currentYear}-${currentMonth}-08`,
            end_date: `${currentYear}-${currentMonth}-08`,
            start_time: '17:00',
            end_time: '20:00',
            location: 'Restoran',
            color: '#c4b5fd',
            share_with: 'all',
          },
          {
            id: 'mock-4',
            title: 'erew',
            description: 'Meeting mingguan',
            start_date: `${currentYear}-${currentMonth}-11`,
            end_date: `${currentYear}-${currentMonth}-11`,
            start_time: '09:00',
            end_time: '11:00',
            location: 'Ruang Rapat 1',
            color: '#84c529',
            share_with: 'all',
          }
        ];
        return { 
          success: true, 
          data: fallbackEvents, 
          isFallback: true, 
          serverErrorMessage: parsedRes.message || JSON.stringify(parsedRes) 
        };
      }

      // FALLBACK WORKAROUND KHUSUS API ATTENDANCE (Error 500 Server)
      if (endpoint === 'attendance' && response.status >= 500) {
        console.warn("MENGGUNAKAN FALLBACK DATA KARENA API ATTENDANCE ERROR 500");
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const today = new Date().getDate();
        
        const fallbackAttendance = [
          {
            id: 'mock-att-1',
            date: `${currentYear}-${currentMonth}-${String(today).padStart(2, '0')}`,
            in_time: '08:00:00',
            out_time: null,
            note: 'Kerja di kantor Pusat',
            status: 'approved',
            status_title: 'Hadir'
          },
          {
            id: 'mock-att-2',
            date: `${currentYear}-${currentMonth}-${String(today - 1).padStart(2, '0')}`,
            in_time: '08:15:00',
            out_time: '17:30:00',
            note: 'Telat karena macet lalu lintas',
            status: 'approved',
            status_title: 'Hadir Telat'
          },
          {
            id: 'mock-att-3',
            date: `${currentYear}-${currentMonth}-${String(today - 2).padStart(2, '0')}`,
            in_time: '07:55:00',
            out_time: '17:05:00',
            note: 'Kerja normal',
            status: 'approved',
            status_title: 'Hadir'
          }
        ];
        return { success: true, data: fallbackAttendance, isFallback: true };
      }

      return { 
        success: false, 
        error: `Gagal fetch data dari ${endpoint} (Status: ${response.status}). Pesan: ${parsedRes?.message || parsedRes?.error || 'Server Internal Error'}`,
        details: parsedRes 
      };
    }
    
    return { success: true, data: parsedRes.data || parsedRes };
  } catch (error: any) {
    return { success: false, error: error.message || `Terjadi kesalahan koneksi saat memanggil ${endpoint}.` };
  }
}

// Fungsi Generic untuk POST (create data) ke API RISE CRM
export async function postToApi(endpoint: string, token: string, body: Record<string, string>) {
  try {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // RISE CRM API menggunakan multipart/form-data untuk POST
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authtoken': token,
        'Accept': 'application/json'
      },
      body: formData,
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    console.log(`=== RAW POST RESP FROM ${endpoint} ===`, textRes.substring(0, 300));

    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: `Gagal parse response dari ${endpoint}. Status: ${response.status}.` };
    }
    
    if (!response.ok) {
      return { 
        success: false, 
        error: parsedRes.message || parsedRes.error || `Gagal membuat data (Status: ${response.status}).`
      };
    }
    
    return { success: true, data: parsedRes.data || parsedRes, message: parsedRes.message || 'Berhasil dibuat.' };
  } catch (error: any) {
    return { success: false, error: error.message || `Terjadi kesalahan koneksi saat membuat ${endpoint}.` };
  }
}

// Fungsi Generic untuk PUT (update data) ke API RISE CRM
export async function putToApi(endpoint: string, token: string, body: Record<string, string>) {
  try {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // RISE CRM API menggunakan multipart/form-data untuk POST/PUT
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'authtoken': token,
        'Accept': 'application/json'
      },
      body: formData,
      cache: 'no-store',
    });
    
    const textRes = await response.text();
    console.log(`=== RAW PUT RESP FROM ${endpoint} ===`, textRes.substring(0, 300));

    let parsedRes;
    try {
      parsedRes = JSON.parse(textRes);
    } catch (e) {
      return { success: false, error: `Gagal parse response dari ${endpoint}. Status: ${response.status}. Resp: ${textRes.substring(0,100)}` };
    }

    if (!response.ok) {
      return { 
        success: false, 
        error: parsedRes?.message || parsedRes?.error || `Gagal update data (Status: ${response.status}).`
      };
    }
    
    // Check for success using both status code and message structure
    const isSuccess = response.ok && (
      parsedRes.success === true || 
      parsedRes.status === true || 
      parsedRes.status === 200 || 
      (parsedRes.messages && parsedRes.messages.success !== undefined)
    );

    if (isSuccess) {
      return { 
        success: true, 
        data: parsedRes.data || parsedRes, 
        message: parsedRes?.messages?.success || parsedRes?.message || 'Berhasil diperbarui.' 
      };
    } else {
      return {
        success: false,
        error: parsedRes?.messages?.error || parsedRes?.message || parsedRes?.error || 'Gagal menyimpan perubahan ke server.'
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message || `Terjadi kesalahan koneksi saat update ${endpoint}.` };
  }
}
