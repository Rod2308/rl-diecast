import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { AdminAuthProvider } from '@/lib/admin-auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'RL Diecast • Miniaturas Colecionáveis 1:64 | Mini GT, Kaido House & Tarmac Works',
  description:
    'Especialista em miniaturas diecast 1:64. Pré-vendas oficiais Mini GT Brasil com entrada facilitada, pronta-entrega, envio seguro para colecionadores e pagamento em Pix ou Cartão.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark bg-[#0a0c12] text-neutral-100 antialiased selection:bg-amber-500 selection:text-black">
      <body className="min-h-screen flex flex-col bg-[#0a0c12] text-neutral-100 font-sans pb-16 md:pb-0">
        <AdminAuthProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileBottomNav />
          </CartProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
