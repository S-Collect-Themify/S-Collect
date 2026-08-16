import { api } from './api';

export interface ApiAdminItem {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  role: string;
  status: string;
  dateAdded?: string;
  createdAt?: string;
}

export interface CreateAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

function extractAdminsArray(data: any): ApiAdminItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.admins)) return data.admins;
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === 'object') {
      if (Array.isArray(data.data.items)) return data.data.items;
      if (Array.isArray(data.data.admins)) return data.data.admins;
    }
  }
  return [];
}

export const getAdminAccounts = async (): Promise<ApiAdminItem[]> => {
  const { data } = await api.get('/admin/admins');
  return extractAdminsArray(data);
};

export const createAdminAccount = async (payload: CreateAdminPayload): Promise<ApiAdminItem> => {
  const { data } = await api.post('/admin/admins', payload);
  if (data?.data) return data.data as ApiAdminItem;
  return data as ApiAdminItem;
};

export const deleteAdminAccount = async (id: string): Promise<void> => {
  await api.delete(`/admin/admins/${id}`);
};

export const activateAdminApi = async (id: string): Promise<ApiAdminItem> => {
  try {
    const { data } = await api.patch(`/admin/admins/${id}/activate`);
    return data?.data || data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      try {
        const { data } = await api.post(`/admin/admins/${id}/activate`);
        return data?.data || data;
      } catch {
        const { data } = await api.patch(`/admin/admins/${id}`, { status: 'ACTIVE' });
        return data?.data || data;
      }
    }
    throw err;
  }
};

export const deactivateAdminApi = async (id: string): Promise<ApiAdminItem> => {
  try {
    const { data } = await api.patch(`/admin/admins/${id}/deactivate`);
    return data?.data || data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      try {
        const { data } = await api.post(`/admin/admins/${id}/deactivate`);
        return data?.data || data;
      } catch {
        const { data } = await api.patch(`/admin/admins/${id}`, { status: 'INACTIVE' });
        return data?.data || data;
      }
    }
    throw err;
  }
};

export const toggleAdminStatusApi = async (
  id: string,
  newStatus: 'ACTIVE' | 'INACTIVE'
): Promise<ApiAdminItem> => {
  if (newStatus === 'ACTIVE') {
    return activateAdminApi(id);
  }
  return deactivateAdminApi(id);
};
