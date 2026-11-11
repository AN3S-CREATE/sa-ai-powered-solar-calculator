import * as React from 'react';
import {
  getLocalSettings,
  updateLocalSettings,
  type LocalOperatorProfile,
} from './local-settings';

interface GenesisAuthValue {
  user: LocalOperatorProfile;
  isAuthenticated: true;
  isLoading: false;
  updateProfile: (profile: LocalOperatorProfile) => void;
  signOut: () => void;
}
const GenesisAuthContext = React.createContext<GenesisAuthValue | null>(null);

export function GenesisAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState(() => getLocalSettings().operator);

  React.useEffect(() => {
    const handleSettings = () => setUser(getLocalSettings().operator);
    window.addEventListener('genesis-settings-updated', handleSettings);
    return () => window.removeEventListener('genesis-settings-updated', handleSettings);
  }, []);

  const updateProfile = React.useCallback((profile: LocalOperatorProfile) => {
    const next = updateLocalSettings({ operator: profile });
    setUser(next.operator);
  }, []);

  const signOut = React.useCallback(() => {
    const localProfile = getLocalSettings().operator;
    setUser(localProfile);
  }, []);

  const value = React.useMemo<GenesisAuthValue>(
    () => ({ user, isAuthenticated: true, isLoading: false, updateProfile, signOut }),
    [user, updateProfile, signOut],
  );

  return <GenesisAuthContext.Provider value={value}>{children}</GenesisAuthContext.Provider>;
}

export function useAuth(): GenesisAuthValue {
  const context = React.useContext(GenesisAuthContext);
  if (!context) throw new Error('useAuth must be used inside GenesisAuthProvider.');
  return context;
}
