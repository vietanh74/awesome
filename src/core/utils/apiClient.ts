import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { BaseClient } from './baseClient';

const setAuthorizationFn = (config: InternalAxiosRequestConfig) => {
  return config;
};

export const apiClient: AxiosInstance = new BaseClient({
  baseURL: `${'http://localhost:7000'}`,
  withActionLogout: false,
  withActionRefresh: false,
}).create({
  setAuthorizationFn,
});
