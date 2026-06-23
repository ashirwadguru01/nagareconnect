import api from './api';

export const getMyAppraisalStats = () => api.get('/appraisals/my-stats');
export const submitAppraisalRequest = (data) => api.post('/appraisals/request', data);
export const getAllAppraisalRequests = (status) => api.get('/appraisals', { params: { status } });
export const reviewAppraisalRequest = (id, data) => api.patch(`/appraisals/${id}`, data);
