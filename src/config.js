// API Configuration
const DEFAULT_PROD_API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_DEFAULT_PROD_API_URL || '';

const normalizeApiBaseUrl = (url) => {
  if (!url) return url;
  let normalized = url.trim();
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  return normalized;
};

const resolveApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return `${process.env.REACT_APP_DEV_API_URL || 'https://sverx.nanoprofiles.com'}`;
  }

  const envBaseUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  return normalizeApiBaseUrl(DEFAULT_PROD_API_URL);
};

export const API_URL = resolveApiBaseUrl();

/** Main marketplace site where public FormPage is hosted (not the admin app). */
const resolvePublicSiteUrl = () => {
  const envUrl = process.env.REACT_APP_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return 'https://www.artartist.in';
};

export const PUBLIC_SITE_URL = resolvePublicSiteUrl();

export const getPublicFormUrl = (formId) =>
  `${PUBLIC_SITE_URL}/forms/${formId}`;

export default API_URL;
