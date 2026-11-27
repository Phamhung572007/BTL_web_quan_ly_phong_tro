import api from './api';

export const layDanhSachNguoiThueApi = (params) => api.get('/nguoi-thue', { params });

export const layChiTietNguoiThueApi = (maNguoiThue) => api.get(`/nguoi-thue/${maNguoiThue}`);

export const taoNguoiThueApi = (duLieu) => api.post('/nguoi-thue', duLieu);

export const capNhatNguoiThueApi = (maNguoiThue, duLieu) => api.put(`/nguoi-thue/${maNguoiThue}`, duLieu);

export const xoaNguoiThueApi = (maNguoiThue) => api.delete(`/nguoi-thue/${maNguoiThue}`);