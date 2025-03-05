export type ReponseMenu = {
  id: number;
  name: string;
  path: string;
  icon: string;
  permission: {
    m_created: number;
    m_view: number;
    m_updated: number;
    m_deleted: number;
  };
  child: ReponseMenu[];
};
