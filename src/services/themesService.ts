import { $axiosPrivate } from './AxiosService';
import { ThemesByChapterResponse } from '../types';

export const themesService = {
  // Get themes grouped by chapters for a subject
  getThemesBySubject: async (subjectId: number): Promise<ThemesByChapterResponse> => {
    const response = await $axiosPrivate.get(`/themes/by-chapter?SubjectId=${subjectId}`);
    return response.data;
  },
};
