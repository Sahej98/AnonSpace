
export const apiFetch = (url, options = {}) => {
    const userId = localStorage.getItem('anonspaceUserId');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (userId) {
        headers['X-User-ID'] = userId;
    }

    return fetch(url, { ...options, headers });
};