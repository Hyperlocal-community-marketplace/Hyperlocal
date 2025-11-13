import { useEffect, useState } from 'react';
import { authService } from '../lib/auth';
import { shopService } from '../lib/shop';

export function useAuthSync() {
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    let isValidatingSession = true;
    const validateSessionOnMount = async () => {
      if (hasValidated) return;
      const userExists = localStorage.getItem('user');
      const sellerExists = localStorage.getItem('seller');
      if (userExists && !sellerExists) {
        try {
          const validatedUser = await authService.validateSession();
          if (!validatedUser && isValidatingSession) {
            console.log('User session invalid on mount');
          }
        } catch (error) {
          console.error('Error validating user session:', error);
        }
      } else if (sellerExists && !userExists) {
        try {
          const validatedSeller = await shopService.validateSession();
          if (!validatedSeller && isValidatingSession) {
            console.log('Seller session invalid on mount');
          }
        } catch (error) {
          console.error('Error validating seller session:', error);
        }
      }
      if (isValidatingSession) {
        setIsValidating(false);
        setHasValidated(true);
      }
    };
    validateSessionOnMount();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'seller') {
        if (e.newValue === null) {
          console.log(`${e.key} logged out in another tab`);
        } else {
          console.log(`${e.key} updated in another tab`);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      isValidatingSession = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [hasValidated]);

  return { isValidating };
}

