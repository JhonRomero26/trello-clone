import { v4 as uuid4 } from "uuid";
import { readLocalStorage, saveLocalStorage } from "../utils/localStorageAPI";

import type { KanbanItemProps, KanbanColumnProps } from "../utils/types/Kanban";

type CreateKanvanItemParams = {
  columnId: string;
  content: string;
};

type UpdateKanvanItemParams = {
  columnId?: string;
  position?: number;
  content?: string;
};

type UpdateKanvanColumnParams = {
  id: string;
  title?: string;
  position?: number;
};

export const getKanbanDataService = (): KanbanColumnProps[] => {
  const data: KanbanColumnProps[] | null = readLocalStorage("kanban-data");

  if (data === null) {
    return [];
  }

  return data;
};

export const createKanbanColumnService = () => {
  const data = getKanbanDataService();
  const column: KanbanColumnProps = {
    id: uuid4(),
    title: "New column",
    items: [],
  };

  data.push(column);
  saveKanbanService<KanbanColumnProps[]>(data);

  return column;
};

export const createKanbanItemService = ({
  columnId,
  content,
}: CreateKanvanItemParams): KanbanItemProps => {
  const data = getKanbanDataService();

  const column = data.find((column) => column.id === columnId);

  if (column === undefined)
    throw new Error(`No exist column with id: ${columnId}`);

  const item: KanbanItemProps = {
    id: uuid4(),
    content,
  };

  column.items.push(item);
  saveKanbanService<KanbanColumnProps[]>(data);

  return item;
};

export const updateKanbanItemService = (
  id: string,
  { columnId, position, content }: UpdateKanvanItemParams
) => {
  const data = getKanbanDataService();

  const itemData: {
    item?: KanbanItemProps;
    currentColumn?: KanbanColumnProps;
  } = {};

  for (const column of data) {
    const item = column.items.find((item) => item.id === id);

    if (item !== undefined) {
      itemData.item = item;
      itemData.currentColumn = column;
      break;
    }
  }

  if (itemData.item === undefined) throw new Error("Item not found");

  if (itemData.item) {
    itemData.item.content =
      content === undefined ? itemData.item.content : content;
  }

  if (columnId !== undefined && position !== undefined) {
    const { item, currentColumn } = itemData;
    const targetColumn = data.find((column) => column.id === columnId);

    if (
      currentColumn !== undefined &&
      targetColumn !== undefined &&
      item !== undefined
    ) {
      currentColumn.items.splice(currentColumn.items.indexOf(item), 1);
      targetColumn.items.splice(position, 0, item);
    } else {
      throw new Error("Target column not found.");
    }
  }

  saveKanbanService<KanbanColumnProps[]>(data);
};

export const updateKanbanColumnService = ({
  id,
  title,
  position,
}: UpdateKanvanColumnParams) => {
  const data = getKanbanDataService();

  const column = data.find((column) => column.id === id);
  console.log(column);

  if (column === undefined) throw new Error("Column not found.");

  column.title =
    title === undefined || title === column.title ? column.title : title;

  if (position !== undefined) {
    const columnIndex = data.indexOf(column);
    console.log({ columnIndex, position });

    data.splice(columnIndex, 1);
    data.splice(position < columnIndex ? position + 1 : position, 0, column);
  }

  saveKanbanService<KanbanColumnProps[]>(data);
};

export const deleteKanbanItemService = (id: string) => {
  const data = getKanbanDataService();

  for (const column of data) {
    const index = column.items.findIndex((item) => item.id === id);

    if (index !== -1) {
      column.items.splice(index, 1);
      break;
    }
  }

  saveKanbanService<KanbanColumnProps[]>(data);
};

export const deleteKanbanColumnService = (id: string) => {
  const data = getKanbanDataService();

  if (data.length === 0) {
    throw new Error("Column not found.");
  }

  const newData = data.filter((column) => column.id !== id);

  saveKanbanService<KanbanColumnProps[]>(newData);
};

export const saveKanbanService = <T>(data: T) => {
  saveLocalStorage({ key: "kanban-data", data });
};
