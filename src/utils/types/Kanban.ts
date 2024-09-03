export type KanbanColumnProps = {
  id: string;
  title: string;
  items: KanbanItemProps[];
};

export type KanbanItemProps = {
  id: string;
  content: string;
};
