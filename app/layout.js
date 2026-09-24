import AdminChatbot from '@/components/AdminChatbot';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <AdminChatbot/>
        </AuthProvider>
      </body>
    </html>
  );
}