import api from './api';

export const getUsers = () => api.get('/admin/users');
export const toggleUser = (id) => api.patch(`/admin/users/${id}/toggle`);
export const changeRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const getWorkers = () => api.get('/admin/workers');
export const getStats = () => api.get('/admin/stats');
export const getWorkerPerformance = () => api.get('/admin/worker-performance');
