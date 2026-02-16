
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  showSidebar: boolean;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
  setShowSidebar: (show: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // Default to true, Sidebar component will update

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed((prev: boolean) => {
        const newState = !prev;
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
        return newState;
      });
    }
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  // Auto-close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed, isMobileSidebarOpen, showSidebar, toggleSidebar, closeMobileSidebar, setShowSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used within LayoutProvider");
  return context;
};
