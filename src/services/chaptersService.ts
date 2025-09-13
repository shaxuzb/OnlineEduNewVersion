import { $axiosPrivate } from './AxiosService';
import { ChaptersResponse } from '../types';

export const chaptersService = {
  // Get chapters by subject ID
  getChaptersBySubjectId: async (subjectId: number): Promise<ChaptersResponse> => {
    const response = await $axiosPrivate.get(`/chapters?SubjectId=${subjectId}`);
    return response.data;
  },

  // Get chapter by ID
  getChapterById: async (id: number): Promise<ChaptersResponse['results'][0]> => {
    const response = await $axiosPrivate.get(`/chapters/${id}`);
    return response.data;
  },
};
