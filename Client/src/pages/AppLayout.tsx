import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar.js';
import Header from '../components/ui/Header.js';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <section className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <Outlet />
      </section>
    </main>
  );
};

export default AppLayout;
