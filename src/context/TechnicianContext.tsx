import React, { createContext, useContext, useState } from 'react';

const TechnicianContext = createContext<any>(null);

export const TechnicianProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(false); // Shared status
  return (
    <TechnicianContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </TechnicianContext.Provider>
  );
};

export const useTechnician = () => useContext(TechnicianContext);