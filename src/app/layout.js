// src/app/layout.js
import "./globals.css";
import Providers from "../components/Providers";
import NavBar from "../components/NavBar";

export const metadata = {
  title: "Staff Arts",
  description: "A gallery in tribute — original mixed-media works.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body>
        <Providers>
          <NavBar />
          <main style={{ minHeight: "calc(100dvh - 64px)" }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
