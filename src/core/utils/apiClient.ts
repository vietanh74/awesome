import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { BaseClient } from './baseClient';

const setAuthorizationFn = (config: InternalAxiosRequestConfig) => {
  return config;
};

export const apiClient: AxiosInstance = new BaseClient({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withActionLogout: false,
  withActionRefresh: false,
}).create({
  setAuthorizationFn,
});
