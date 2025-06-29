import { Nullable } from 'src/commons/utils/utils.types';

export type ApplicationResponse = Nullable<{
  id: number;
  name: string;
  version: string;
}>;
