import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { BaseClient } from './baseClient';

const setAuthorizationFn = (config: InternalAxiosRequestConfig) => {
  return config;
};

export const apiClient: AxiosInstance = new BaseClient({
  baseURL: `${'https://public-api-me.onrender.com'}`,
  withActionLogout: false,
  withActionRefresh: false,
}).create({
  setAuthorizationFn,
});
