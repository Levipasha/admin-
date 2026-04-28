// API Configuration
const DEFAULT_PROD_API_URL = 'https://server-one-psi-87.vercel.app';

const normalizeApiBaseUrl = (url) => {
  if (!url) return url;
  let normalized = url.trim();
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  return normalized;
};

const resolveApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }

  const envBaseUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  return normalizeApiBaseUrl(DEFAULT_PROD_API_URL);
};

export const API_URL = resolveApiBaseUrl();
export default API_URL;
