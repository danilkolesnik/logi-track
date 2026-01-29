import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject({
        message: error.response.data?.error || 'An error occurred',
        status: error.response.status,
      });
    }
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      status: 0,
    });
  }
);

export default apiClient;
