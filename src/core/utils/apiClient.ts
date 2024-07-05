import { AxiosInstance } from 'axios';
import { BaseClient } from './baseClient';

export const apiClient: AxiosInstance = new BaseClient({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withActionLogout: true,
  withActionRefresh: false,
}).create();
