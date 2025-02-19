import { apiClient, IResponse } from '@/core';

class JiraService {
  async searchIssues(params): Promise<IResponse> {
    return await apiClient.get('search', {
      params,
    });
  }
}

export const jiraService = new JiraService();
