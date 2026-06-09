'use server';

import { publicApi } from '../axiosInstance';

const EMPTY_GLOBAL_SCRIPTS = {
  head_code: null,
  body_code: null,
  footer_code: null,
};

export const getGlobalScripts = async () => {
  try {
    const response = await publicApi.get('/api/global-scripts');
    return response?.data?.data || EMPTY_GLOBAL_SCRIPTS;
  } catch {
    return EMPTY_GLOBAL_SCRIPTS;
  }
};
