/**
 * Centralized Configuration for Solu Platform
 */

const isProduction = !window.location.hostname.includes('localhost');

export const CONFIG = {
  // Production URL for Cloud Run Backend
  // Fallback to localhost if developing locally
  API_BASE_URL: isProduction 
    ? 'https://solu-live-36265478306.us-central1.run.app' 
    : 'http://localhost:8000',

  // Primary Domain for Subdomain Generation
  BASE_DOMAIN: 'solu.uk',

  IS_PRODUCTION: isProduction
};

export default CONFIG;
