import axios from 'axios';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: send cookies with requests
});

export const apiClient = {
  async getIndexSummary() {
    const res = await client.get('/api/v1/index');
    return res.data;
  },

  async getIndexHistory(limit = 50) {
    const res = await client.get(`/api/v1/index/history?limit=${limit}`);
    return res.data;
  },

  async getRoutes() {
    const res = await client.get('/api/v1/routes');
    return res.data;
  },

  async getRouteDetail(routeId: string) {
    const res = await client.get(`/api/v1/routes/${routeId}`);
    return res.data;
  },

  async getAirlines() {
    const res = await client.get('/api/v1/airlines');
    return res.data;
  },

  async getLeadTimeAnalysis() {
    const res = await client.get('/api/v1/lead-time');
    return res.data;
  },

  async getHeatmap() {
    const res = await client.get('/api/v1/heatmap');
    return res.data;
  },

  async getObservations(page = 1, limit = 50, route?: string, carrier?: string, leadTime?: string) {
    let url = `/api/v1/observations?page=${page}&limit=${limit}`;
    if (route) url += `&route=${route}`;
    if (carrier) url += `&carrier=${carrier}`;
    if (leadTime) url += `&leadTime=${leadTime}`;
    const res = await client.get(url);
    return res.data;
  },

  async getAlerts() {
    const res = await client.get('/api/v1/alerts');
    return res.data;
  },

  async getApiKeys() {
    const res = await client.get('/api/v1/admin/api-keys');
    return res.data;
  },

  async createApiKey(orgId: string, scope = 'read:index', rateTier = 'standard') {
    const res = await client.post('/api/v1/admin/api-keys', { orgId, scope, rateTier });
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await client.post('/api/v1/auth/login', { email, password });
    return res.data;
  },

  async register(email: string, password: string) {
    const res = await client.post('/api/v1/auth/register', { email, password });
    return res.data;
  },

  async logout() {
    const res = await client.post('/api/v1/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await client.get('/api/v1/auth/me');
    return res.data;
  }
};
