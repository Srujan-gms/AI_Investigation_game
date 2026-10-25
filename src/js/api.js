/**
 * REST API Client for AI Mystery Room
 */
const BASE_URL = '';

export async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getMe: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  generateMystery: (prompt, genre, difficulty) =>
    request('/api/mystery/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, genre, difficulty })
    }),

  pollStatus: (id) => request(`/api/mystery/${id}/status`),

  getMystery: (id) => request(`/api/mystery/${id}`),

  submitVerdict: (id, suspectId) =>
    request(`/api/mystery/${id}/verdict`, {
      method: 'POST',
      body: JSON.stringify({ suspectId })
    }),

  getHistory: () => request('/api/mystery/history'),

  getSession: (mysteryId) => request(`/api/session/${mysteryId}`),

  updateSession: (mysteryId, data) =>
    request(`/api/session/${mysteryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  getHint: (mysteryId) =>
    request(`/api/session/${mysteryId}/hint`, { method: 'POST' })
};
