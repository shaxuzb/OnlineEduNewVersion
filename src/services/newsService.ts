import {NewsResponse } from '../types';
import { $axiosPrivate } from './AxiosService';

export const newsService = {
  // Get all subjects
  getNews: async (): Promise<NewsResponse> => {
    const response = await $axiosPrivate.get('/news');
    return response.data;
  },

};
