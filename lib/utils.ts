export const colors = {
  primary: '#F2F1F0', // Global Background
  bg: '#F2F1F0',      // Alias for background
  gold: '#C69C3D',    // Secondary Brand
  dark: '#2C2A29',    // Secondary Text/Elements
  cream: '#F4EBD4',   // Third Color (Accents)
  card: '#FFFFFF',
  border: '#E8E4E1',
  textMuted: '#6B6865',
  redAccent: '#E04F3F'
};



export const getUserImage = (user: any) => {
  if (!user) return "https://ui-avatars.com/api/?name=User&background=C69C3D&color=2C2A29";
  
  const imgUrl = user.image || user.avatar || "";
  
  const serializedMatch = imgUrl.match(/"file_name";s:\d+:"([^"]+)"/);
  if (serializedMatch && serializedMatch[1]) {
    return `https://brain.havia.id/files/profile_images/${serializedMatch[1]}`;
  }

  if (imgUrl.trim() === "" || imgUrl.includes("avatar.jpg") || imgUrl.includes("default") || imgUrl === "null") {
    const name = user.name || (user.first_name ? `${user.first_name} ${user.last_name || ''}` : "U");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=C69C3D&color=2C2A29&bold=true`;
  }
  
  return imgUrl;
};

export const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp0';
  return new Intl.NumberFormat('en-US', {
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
    return d.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch { return dateStr; }
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 10) return "Good Morning";
  if (hour < 15) return "Good Afternoon";
  if (hour < 18) return "Good Evening";
  return "Good Night";
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
