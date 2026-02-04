'use client';

/**
 * Auth utility functions for client-side
 */

let isRedirecting = false;

/**
 * Handle authentication errors and redirect to login if needed
 * @param error - The error object or response
 */
export function handleAuthError(error: any): void {
  if (typeof window === 'undefined') return; // Skip on server-side
  if (isRedirecting) return; // Prevent multiple redirects

  // Check if it's a 401 error
  if (error?.status === 401 || error?.response?.status === 401) {
    isRedirecting = true;
    
    // Clear any client-side storage if needed
    try {
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    
    // Redirect to login page
    console.log('Token revoked or expired. Redirecting to login...');
    window.location.href = '/login';
  }
}

let isHandlerSetup = false;

/**
 * Setup global error handler for fetch requests
 * Call this in your root layout to automatically handle auth errors
 */
export function setupAuthErrorHandler() {
  if (typeof window === 'undefined') return;
  if (isHandlerSetup) return; // Prevent multiple setups
  
  isHandlerSetup = true;

  // Intercept fetch globally
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      
      // Clone response to check status without consuming it
      const clonedResponse = response.clone();
      
      if (clonedResponse.status === 401) {
        // Check if it's an API call (not auth endpoints)
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        const isAuthEndpoint = url.includes('/api/auth/');
        
        if (!isAuthEndpoint) {
          handleAuthError({ status: 401 });
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
}
