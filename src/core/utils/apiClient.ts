import { BaseClient } from './baseClient';

export const apiClient = new BaseClient({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withActionLogout: true,
  withActionRefresh: false,
}).create();
