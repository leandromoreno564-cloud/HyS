import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Base URL for API calls to Laravel backend
window.axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
