
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  onMenuClick?: (menuId: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onMenuClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar onMenuClick={onMenuClick} />
      <main className="ml-64 pt-16 p-6">
        {children}
      </main>
    </div>
  );
};
