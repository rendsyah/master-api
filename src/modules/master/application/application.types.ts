import { Nullable } from 'src/commons/utils/utils.types';

export type GetApplicationResponse = Nullable<{
  id: number;
  name: string;
  version: string;
}>;
