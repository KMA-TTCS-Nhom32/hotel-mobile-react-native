import axios from 'axios';

const BASE_URL = 'https://early-pens-lead.loca.lt'; // hoặc IP local

export const updateProfileService = async (data: {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birth_date: string;
  avatar?: string;
}) => {
  const response = await axios.put(`${BASE_URL}/users/profile`, data);
  return response.data;
};
