import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Mega Gaming Platform - 30 Awesome Games',
  description: 'Play 30+ amazing games including Sudoku, Tic Tac Toe, Temple Run, Shadow Fight and more!',
  keywords: 'games, online games, puzzle games, action games, multiplayer games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
