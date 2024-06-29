import { apiClient, IResponse } from '@/core';

class CommonService {
  async uploadFile(data): Promise<IResponse> {
    return await apiClient.post('upload', data);
  }
}

export const commonService = new CommonService();
