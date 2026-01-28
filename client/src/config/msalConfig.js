import { PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'your-client-id-here',
    // For organization-specific login (e.g., tinhvan.com)
    authority: import.meta.env.VITE_MICROSOFT_TENANT_ID 
      ? `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`
      : 'https://login.microsoftonline.com/organizations', // For any organization
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};