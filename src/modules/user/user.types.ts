import { IPaginationResponse, Nullable } from 'src/commons/utils/utils.types';

type Base = {
  success: boolean;
  message: string;
};

export type UserResponse = Nullable<{
  id: number;
  fullname: string;
  access: string;
  email: string;
  phone: string;
  image: string;
}>;

export type UserListResponse = IPaginationResponse<{
  id: number;
  fullname: string;
  access: string;
  email: string;
  phone: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}>;

export type CreateAccessResponse = Base;

export type UpdateAccessResponse = Base;
