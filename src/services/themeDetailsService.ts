import { $axiosPrivate } from './AxiosService';
import { ThemeDetail } from '../types';

export const themeDetailService = {
  // Get themes grouped by chapters for a subject
  getThemeDetail: async (themeId: number): Promise<ThemeDetail> => {
    const response = await $axiosPrivate.get(`/themes/${themeId}`);
    return response.data;
  },
};
