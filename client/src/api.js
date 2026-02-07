
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = (url, options = {}) => {
    const userId = localStorage.getItem('anonspaceUserId');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (userId) {
        headers['X-User-ID'] = userId;
    }

    return fetch(`${BASE_URL}${url}`, { ...options, headers });
};
