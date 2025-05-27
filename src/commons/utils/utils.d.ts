declare namespace Utils {
  type Nullable<T> = T | undefined;

  type IValidateString = 'char' | 'numeric' | 'encode' | 'decode';

  type IValidateReplacePhone = '08' | '62';

  type IValidateRandomChar = 'alpha' | 'numeric' | 'alphanumeric';

  type IValidatePaginationSort = 'ASC' | 'DESC';

  type IFile = {
    type: 'image' | 'file';
    dest: string;
    mimes?: string[];
    maxSize?: number;
  };

  type IPagination = {
    page: number;
    limit: number;
    skip?: number;
    isActive?: number;
    orderBy?: string;
    sort?: IValidatePaginationSort;
    sortCondition?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };

  type IPaginationMeta = {
    limit?: number;
    page?: number;
    getMore?: boolean;
    totalData?: number;
    totalPage?: number;
    totalPerPage?: number;
  };

  type IPaginationResponse<T> = {
    items: T[];
    meta: IPaginationMeta;
  };

  type IUser = {
    id: number;
    name: string;
    access: string;
    iat: number;
    exp: number;
  };

  type IMenu = {
    id: number;
    name: string;
    path: string;
    icon: string;
    level: number;
    permission?: IPermission;
    child: IMenu[];
  };
}
