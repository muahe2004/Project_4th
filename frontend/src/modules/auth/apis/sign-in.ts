import axios from 'axios';
import { useMutation,  } from '@tanstack/react-query';

// Kiểu dữ liệu request gửi lên API
interface LoginRequest {
  username: string;
  password: string;
}

// Kiểu dữ liệu thông tin user trong response
interface UserInfo {
  id: string;
  full_name: string;
  code: string;
  role: string;
}

// Kiểu dữ liệu response từ API login
interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

// Hàm gọi API login
const signIn = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await axios.post<LoginResponse>('http://localhost:8000/ums/api/auth/login', data);
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