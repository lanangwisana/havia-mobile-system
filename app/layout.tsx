import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Havia Mobile System",
  description: "Havia Studio & GampaWorks Enterprise Mobile App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Havia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A1918",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/Vector.png" />
        <link id="dynamic-favicon" rel="icon" type="image/png" href="/LogoHavia_primary2.png" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
              // Scaler for Favicon
              (function() {
                const img = new Image();
                img.src = '/LogoHavia_primary2.png';
                img.onload = function() {
                  const canvas = document.createElement('canvas');
                  canvas.width = 64; canvas.height = 64;
                  const ctx = canvas.getContext('2d');
                  const padding = 12; // padding scale
                  ctx.drawImage(img, padding, padding, canvas.width - padding*2, canvas.height - padding*2);
                  const fav = document.getElementById('dynamic-favicon');
                  if (fav) fav.href = canvas.toDataURL('image/png');
                };
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
