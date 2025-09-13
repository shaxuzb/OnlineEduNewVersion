import { SubjectsResponse } from '../types';
import { $axiosPrivate } from './AxiosService';

export const subjectsService = {
  // Get all subjects
  getSubjects: async (): Promise<SubjectsResponse> => {
    const response = await $axiosPrivate.get('/subjects');
    return response.data;
  },

  // Get subject by ID
  getSubjectById: async (id: number): Promise<SubjectsResponse['results'][0]> => {
    const response = await $axiosPrivate.get(`/subjects/${id}`);
    return response.data;
  },
};
