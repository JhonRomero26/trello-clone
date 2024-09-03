import KanbanDropZone from "./KanbanDropZone";
import {
  deleteKanbanItemService,
  updateKanbanItemService,
} from "./services/kanban";

type KanbanItemElement = {
  root: HTMLDivElement;
  input: HTMLDivElement | null;
};

export default class KanbanItem {
  public elements: KanbanItemElement;
  #content: string;
  #bottomDropZone: HTMLDivElement;

  constructor(id: string, content: string) {
    this.elements = { root: KanbanItem.createRoot(), input: null };
    this.elements.input =
      this.elements.root.querySelector<HTMLDivElement>(".kanban-item-input");
    this.#content = content;
    this.#bottomDropZone = KanbanDropZone.createItemDropZone();

    this.elements.root.dataset.id = id;
    this.elements.root.appendChild(this.#bottomDropZone);

    if (this.elements.input) {
      this.elements.input.textContent = content;
      this.elements.input.addEventListener("blur", this.#handleBlur.bind(this));
    }

    this.elements.root.addEventListener("dragstart", (e) => {
      const isElement = (e.target as HTMLDListElement).classList.contains(
        "kanban-item"
      );
      if (isElement) {
        e.dataTransfer?.setData(
          "text/plain",
          JSON.stringify({
            id,
            className: "kanban-item",
          })
        );
      }
    });

    this.elements.root.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    this.elements.root.addEventListener("dblclick", () => {
      const check = confirm("Are you sure want to delete this item?");

      if (check) {
        this.elements.root.removeEventListener("blur", this.#handleBlur);

        this.elements.root.parentElement?.removeChild(this.elements.root);
        deleteKanbanItemService(id);
      }
    });
  }

  static createRoot(): HTMLDivElement {
    const range = document.createRange();
    range.selectNode(document.body);

    return range.createContextualFragment(`
      <li class="kanban-item" draggable="true">
        <div class="kanban-item-input" contenteditable></div>
      </li>
    `).children[0] as HTMLDivElement;
  }

  #handleBlur() {
    const { id } = this.elements.root.dataset;
    const newContent = this.elements.input?.textContent?.trim();

    if (newContent === this.#content) return;

    if (id !== undefined && newContent !== null && newContent !== undefined) {
      this.#content = newContent;
      updateKanbanItemService(id, { content: this.#content });
    }
  }
}
