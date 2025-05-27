declare namespace Response {
  type SignSession = {
    access_token: string;
    session_id: string;
  };

  type Session = {
    session: boolean;
  };

  type Me = {
    id: number;
    name: string;
    access: string;
  };

  type Menu = IMenu[];

  type Permission = {
    id: number;
    path: string;
    m_created: number;
    m_updated: number;
    m_deleted: number;
  };

  type Login = {
    access_token: string;
    redirect_to: string;
  };
}
