import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

export type UserResponse = Nullable<{
  id: number;
  fullname: string;
  access_name: string;
  email: string;
  phone: string;
  image: string;
}>;

export type ListUserResponse = IPaginationResponse<{
  id: number;
  fullname: string;
  access_name: string;
  email: string;
  phone: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;
