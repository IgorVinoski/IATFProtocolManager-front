
import { createContext, useContext, useState } from 'react';

const AnimalContext = createContext<any>(null);

export const AnimalProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAnimals = () => setRefreshKey(prev => prev + 1);

  return (
    <AnimalContext.Provider value={{ refreshKey, refreshAnimals }}>
      {children}
    </AnimalContext.Provider>
  );
};

export const useAnimalContext = () => useContext(AnimalContext);
