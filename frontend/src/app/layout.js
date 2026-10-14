import "./globals.css";
import { Fraunces, Public_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "Student Management System",
  description: "Courses, enrollment and role-based access",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
