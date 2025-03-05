export type IValidateString = 'char' | 'numeric' | 'encode' | 'decode';

export type IValidateReplacePhone = '08' | '62';

export type IValidateRandomChar = 'alpha' | 'numeric' | 'alphanumeric';

export type IValidatePaginationSort = 'ASC' | 'DESC';

export type IPagination = {
  page: number;
  limit: number;
  skip?: number;
  status?: number;
  orderBy?: string;
  sort?: IValidatePaginationSort;
  sortCondition?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  users?: IUser;
};

export type IPaginationFilter = {
  startDate: string;
  endDate: string;
  column: string;
};

export type IPaginationResponse<T> = {
  // Pagination Response Base
  data: T[];
  limit?: number;

  // Pagination Response Infinite
  getMore?: boolean;

  // Pagination Response Table
  page?: number;
  totalData?: number;
  totalPage?: number;
  totalPerPage?: number;
};

export type IUser = {
  id: number;
  name: string;
  access: string;
  permission: number;
  iat: number;
  exp: number;
};
