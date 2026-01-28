import { PublicClientApplication } from '@azure/msal-browser';
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'your-client-id-here',
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
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};