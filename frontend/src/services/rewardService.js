import api from './api';

export const getCatalog = () => api.get('/rewards/catalog');
export const getMyPoints = () => api.get('/rewards/my-points');
export const getTransactions = () => api.get('/rewards/transactions');
export const redeemReward = (catalog_id) => api.post('/rewards/redeem', { catalog_id });
