import axios from 'axios';

import { ENV, IS_PRODUCTION } from '@/config';

const publicRequest = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: IS_PRODUCTION ? 15000 : 30000, // Longer timeout in development
});

export default publicRequest;
