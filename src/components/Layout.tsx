
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
      <div className="flex pt-16"> {/* Adiciona padding-top para compensar o header fixo */}
        <Sidebar onMenuClick={onMenuClick} />
        <main className="flex-1 p-6 ml-64"> {/* Adiciona margin-left para compensar a sidebar fixa */}
          {children}
        </main>
      </div>
    </div>
  );
};
