declare namespace Response {
  type Base = {
    success: boolean;
    message: string;
  };

  type User = Utils.Nullable<{
    id: number;
    fullname: string;
    access: string;
    email: string;
    phone: string;
    image: string;
  }>;

  type CreateAccess = Base;

  type UpdateAccess = Base;
}
