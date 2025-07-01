export type Nullable<T> = T | undefined;

export type IValidateString = 'char' | 'numeric' | 'encode' | 'decode';

export type IValidateReplacePhone = '08' | '62';

export type IValidateRandomChar = 'alpha' | 'numeric' | 'alphanumeric';

export type IValidatePaginationSort = 'ASC' | 'DESC';

export type IFile = {
  type: 'image' | 'file';
  dest: string;
  mimes?: string[];
  maxSize?: number;
};

export type IFileResponse = {
  filepath: string;
  fullpath: string;
};

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
};

export type IPaginationMeta = {
  limit?: number;
  page?: number;
  getMore?: boolean;
  totalData?: number;
  totalPage?: number;
  totalPerPage?: number;
};

export type IPaginationResponse<T> = {
  items: T[];
  meta: IPaginationMeta;
};

export type IUser = {
  id: number;
  name: string;
  access_name: string;
  iat: number;
  exp: number;
};

export type IMenu = {
  id: number;
  name: string;
  path: string;
  icon: string;
  level: number;
  child: IMenu[];
};

export type MutationResponse = {
  success: boolean;
  message: string;
};
