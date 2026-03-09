// Global event emitter for 401 errors
let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const handleApiResponse = async (response) => {
  if (response.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }
  return response;
};

export const apiRequest = async (url, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user?.token || user?.accessToken;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  await handleApiResponse(response);
  
  return response;
};
