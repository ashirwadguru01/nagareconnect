import api from './api';

export const createComplaint = (formData) =>
  api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getAllComplaints = (params) => api.get('/complaints', { params });
export const getMyComplaints = () => api.get('/complaints/my');
export const getAssignedComplaints = () => api.get('/complaints/assigned');
export const getAvailableComplaints = () => api.get('/complaints/available');
export const selfAssign = (id) => api.patch(`/complaints/${id}/self-assign`);
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const updateStatus = (id, data) => api.patch(`/complaints/${id}/status`, data);
export const assignComplaint = (id, worker_id) => api.patch(`/complaints/${id}/assign`, { worker_id });
export const getMapComplaints = () => api.get('/complaints/map');
