import { api } from '../api';

export interface UploadImageResult {
  fileName: string;
  url: string;
}

export async function uploadImage(file: File): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadImageResult>('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
