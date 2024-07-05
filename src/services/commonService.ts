import { apiClient, IResponse } from '@/core';

class CommonService {
  async uploadFile(data): Promise<IResponse> {
    return await apiClient.post('upload', data);
  }

  async login(data): Promise<IResponse> {
    return await apiClient.post('login', data);
  }
}

export const commonService = new CommonService();
