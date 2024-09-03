import KanbanItem from "./KanbanItem";
import { KanbanItemProps } from "./utils/types/Kanban";
import {
  createKanbanItemService,
  deleteKanbanColumnService,
  updateKanbanColumnService,
} from "./services/kanban";
import KanbanDropZone from "./KanbanDropZone";

type KanbanColumnElements = {
  root: HTMLDivElement;
  title: HTMLDivElement | null;
  listItems: HTMLUListElement | null;
  btnAddItem: HTMLButtonElement | null;
  btnRemoveColumn: HTMLButtonElement | null;
};

export default class KanbanColumn {
  public elements: KanbanColumnElements;
  public items: KanbanItemProps[];
  #topDropZone: HTMLDivElement;
  #rightDropZone: HTMLDivElement;
  #title: string;

  constructor(id: string, title: string, items: KanbanItemProps[]) {
    this.elements = {
      root: this.#createRoot(),
      title: null,
      listItems: null,
      btnAddItem: null,
      btnRemoveColumn: null,
    };
    this.elements.title =
      this.elements.root.querySelector<HTMLDivElement>(".kanban-title");
    this.elements.listItems =
      this.elements.root.querySelector<HTMLUListElement>(".kanban-list");
    this.elements.btnAddItem =
      this.elements.root.querySelector<HTMLButtonElement>(".kanban-add-item");
    this.elements.btnRemoveColumn =
      this.elements.root.querySelector<HTMLButtonElement>(
        ".kanban-delete-column"
      );
    this.items = items;
    this.#title = title;
    this.#topDropZone = KanbanDropZone.createItemDropZone();
    this.#rightDropZone = KanbanDropZone.createColumnDropZone();

    this.elements.root.dataset.id = id;
    if (this.elements.title) this.elements.title.innerText = title;
    this.elements.listItems?.appendChild(this.#topDropZone);
    this.elements.root.appendChild(this.#rightDropZone);
    this.items.forEach((item) => this.renderItem(item));

    this.elements.btnAddItem?.addEventListener(
      "click",
      this.#createItem.bind(this)
    );

    this.elements.title?.addEventListener("blur", () => {
      const newTitle = this.elements.title?.textContent ?? "";
      this.#title = newTitle === this.#title ? this.#title : newTitle;

      updateKanbanColumnService({ id, title: this.#title });
    });
    this.elements.root.addEventListener("dragstart", (e) => {
      const isElement = (e.target as HTMLDListElement).classList.contains(
        "kanban-container"
      );
      if (isElement) {
        e.dataTransfer?.setData(
          "text/plain",
          JSON.stringify({
            id,
            className: "kanban-container",
          })
        );
      }
    });

    this.elements.root.addEventListener("drop", (e) => {
      e.preventDefault();
      const isElement = (e.target as HTMLDListElement).classList.contains(
        "kanban-container"
      );
      if (isElement) {
        e.dataTransfer?.items.add("class", "kanban-container");
      }
    });

    if (this.elements.btnRemoveColumn)
      this.elements.btnRemoveColumn.addEventListener("click", () => {
        deleteKanbanColumnService(id);

        this.elements.btnAddItem?.removeEventListener(
          "click",
          this.#createItem
        );

        this.elements.root.parentElement?.removeChild(this.elements.root);
      });
  }

  #createRoot(): HTMLDivElement {
    const range = document.createRange();
    range.selectNode(document.body);

    return range.createContextualFragment(`
      <div class="kanban-container" draggable="true">
        <div class="kanban-body">
          <div class="kanban-head">
          <div class="kanban-title" contenteditable></div>
          <button class="kanban-delete-column">X</button>
        </div>
        <ul class="kanban-list"></ul>
        <button class="kanban-add-item">Add Item</button>
        </div>
      </div>
    `).children[0] as HTMLDivElement;
  }

  public renderItem({ id, content }: KanbanItemProps) {
    const item = new KanbanItem(id, content);

    if (this.elements.listItems)
      this.elements.listItems.appendChild(item.elements.root);
  }

  #createItem() {
    const { id: columnId } = this.elements.root.dataset;

    if (this.elements.listItems !== null && columnId !== undefined) {
      const item = createKanbanItemService({
        columnId,
        content: "",
      });

      this.renderItem(item);
    }
  }
}
