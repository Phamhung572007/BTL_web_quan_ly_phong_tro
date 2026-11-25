import api from './api';

export const layDanhSachOGhepApi = (params) => api.get('/ho-so-o-ghep', { params });

export const layHoSoOGhepCuaToiApi = () => api.get('/ho-so-o-ghep/cua-toi');

export const layChiTietHoSoOGhepApi = (maHoSo) => api.get(`/ho-so-o-ghep/${maHoSo}`);

export const taoHoSoOGhepApi = (duLieu) => api.post('/ho-so-o-ghep', duLieu);

export const capNhatHoSoOGhepCuaToiApi = (duLieu) => api.put('/ho-so-o-ghep/cua-toi', duLieu);

export const xoaHoSoOGhepCuaToiApi = () => api.delete('/ho-so-o-ghep/cua-toi');