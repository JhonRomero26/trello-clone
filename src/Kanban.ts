import KanbanColumn from "./KanbanColumn";
import {
  createKanbanColumnService,
  getKanbanDataService,
} from "./services/kanban";
import { KanbanColumnProps } from "./utils/types/Kanban";

export default class Kanban {
  public elements: {
    root?: HTMLDivElement | null;
    wrapper: HTMLDivElement;
  };

  constructor() {
    this.elements = {
      wrapper: document.createElement("div"),
    };
    this.elements.root = document.querySelector<HTMLDivElement>(".kanban");

    this.#renderKanban();
  }

  columns() {
    const data = getKanbanDataService();
    return data;
  }

  #renderKanban() {
    this.elements.wrapper.classList.add("kanban-wrapper");
    const addColumnBtn = document.createElement("button");
    addColumnBtn.innerText = "Agregar columna";
    addColumnBtn.addEventListener("click", () => {
      const column = createKanbanColumnService();
      this.#renderColumn(column);
    });

    this.elements.root?.appendChild(addColumnBtn);
    this.columns().forEach(({ id, title, items }) => {
      this.#renderColumn({ id, title, items });
    });

    if (this.elements.root)
      this.elements.root.appendChild(this.elements.wrapper);
  }

  #renderColumn({ id, title, items }: KanbanColumnProps) {
    const column = new KanbanColumn(id, title, items);

    if (this.elements.root)
      this.elements.wrapper.appendChild(column.elements.root);
  }
}
