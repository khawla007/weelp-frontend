import axios from 'axios';
// export const fetcher = (url) => axios.get(url).then((res) => res.data);

export const fetcher = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // console.error(`Axios Error: ${error.response?.status} - ${error.message} | URL: ${url}`);
      throw new Error(`API Error (${error.response?.status}): ${error.message}`);
    } else {
      // console.error(`Unexpected Error: ${error} | URL: ${url}`);
      throw new Error('Unexpected Error Occurred');
    }
  }
};
