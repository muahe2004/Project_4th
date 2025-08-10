import axios from 'axios';
import { useMutation,  } from '@tanstack/react-query';
import { URL_API_AUTH } from '../../../constants/config'

interface LoginRequest {
  username: string;
  password: string;
}

interface UserInfo {
  id: string;
  full_name: string;
  code: string;
  role: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

const signIn = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await axios.post<LoginResponse>(`${URL_API_AUTH}`, data, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const useSignIn = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: signIn,
  });
};