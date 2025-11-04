import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { Inter, Poppins } from 'next/font/google'
import { DarpanAssistant } from '@/components/darpan-assistant';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'Darpan Wears',
  description: 'Your one-stop shop for the latest fashion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          {children}
          <DarpanAssistant />
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
