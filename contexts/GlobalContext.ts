import { createContext, useContext } from 'react';

// Export a generic context to avoid Prop Drilling
export const GlobalContext = createContext<any>(null);

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalContext.Provider');
  }
  return context;
}
