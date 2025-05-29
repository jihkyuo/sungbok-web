import axios from 'axios';

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  // timeout: 10000,
  // headers: {
  //   'Access-Control-Allow-Origin': import.meta.env.VITE_API_URL,
  // },
});
