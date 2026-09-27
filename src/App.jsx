import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard'; 
// Importa aquí tus otras vistas: SitesPage, SensorsPage, InterventionsPage

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
    { id: 'sites', icon: '⌖', label: 'Centros de cultivo' },
    { id: 'sensors', icon: '◉', label: 'Sensores' },
    { id: 'interventions', icon: '⚠', label: 'Intervenciones' },
  ];

  const currentMenuLabel = menuItems.find(item => item.id === activePage)?.label;

  return (
    // Body / App wrapper: equivale al root de tu CSS
    <div className="flex min-h-screen font-sans text-[#172033] bg-[#f4f7fb]">
      
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        menuItems={menuItems} 
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="ml-[70px] md:ml-[260px] w-[calc(100%-70px)] md:w-[calc(100%-260px)] min-h-screen">
        
        <Topbar currentLabel={currentMenuLabel} />

        {/* CONTENEDOR CENTRAL (.content) */}
        <div className="p-[25px_20px] md:p-[35px_38px_60px] max-w-[1600px] mx-auto">
          {activePage === 'dashboard' && <Dashboard setActivePage={setActivePage} />}
          {/* 
            {activePage === 'sites' && <SitesPage />}
            {activePage === 'sensors' && <SensorsPage />}
            {activePage === 'interventions' && <InterventionsPage />} 
          */}
        </div>

      </main>
    </div>
  );
}