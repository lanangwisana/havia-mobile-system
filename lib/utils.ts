export const colors = {
  gold: '#C69C3D',
  darkGold: '#b59020',
  bg: '#0a0a0a',
  card: '#171717',
  border: '#262626',
  textMuted: '#a3a3a3',
  redAccent: '#F43F5E'
};

export const getUserImage = (user: any) => {
  if (!user) return "https://ui-avatars.com/api/?name=User&background=D4AF37&color=111";
  
  const imgUrl = user.image || user.avatar || "";
  
  const serializedMatch = imgUrl.match(/"file_name";s:\d+:"([^"]+)"/);
  if (serializedMatch && serializedMatch[1]) {
    return `https://brain.havia.id/files/profile_images/${serializedMatch[1]}`;
  }

  if (imgUrl.trim() === "" || imgUrl.includes("avatar.jpg") || imgUrl.includes("default") || imgUrl === "null") {
    const name = user.name || (user.first_name ? `${user.first_name} ${user.last_name || ''}` : "U");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=D4AF37&color=111&bold=true`;
  }
  
  return imgUrl;
};

export const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === '0000-00-00' || dateStr.startsWith('-0001')) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch { return dateStr; }
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 10) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

export const getAttendanceStatus = () => {
  const now = new Date();
  const shiftStart = new Date();
  shiftStart.setHours(8, 0, 0, 0);

  const lateThreshold = new Date(shiftStart.getTime() + 15 * 60000); 

  if (now > lateThreshold) {
    return { status: "LATE", color: "text-red-500" };
  }
  return { status: "ON TIME", color: "text-green-500" };
};
