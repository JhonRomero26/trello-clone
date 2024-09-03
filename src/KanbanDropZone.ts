import {
  updateKanbanColumnService,
  updateKanbanItemService,
} from "./services/kanban";

export default class KanbanDropZone {
  public static createItemDropZone(): HTMLDivElement {
    const range = document.createRange();
    range.selectNode(document.body);

    const dropZone = range.createContextualFragment(`
      <div class="kanban-dropzone"></div>
    `).children[0] as HTMLDivElement;

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("active");
    });

    dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dropZone.classList.remove("active");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      const jsonData = e.dataTransfer?.getData("text/plain");
      if (jsonData) {
        const dataTransfer = JSON.parse(jsonData);

        if (dataTransfer["className"] === "kanban-item") {
          dropZone.classList.remove("active");

          const columnElement = dropZone.closest(
            ".kanban-container"
          ) as HTMLUListElement;
          const columnId = columnElement.dataset.id;
          const dropZonesInColumn = Array.from(
            columnElement.querySelectorAll(".kanban-dropzone")
          );
          const droppedIndex = dropZonesInColumn.indexOf(dropZone);
          const itemId = dataTransfer["id"];

          if (itemId !== undefined) {
            const droppedItemElement = document.querySelector<HTMLDivElement>(
              `[data-id="${itemId}"`
            );
            console.log(droppedItemElement);
            const insertAfter = dropZone.parentElement?.classList.contains(
              "kanban-item"
            )
              ? dropZone.parentElement
              : dropZone;
            console.log(insertAfter);
            if (droppedItemElement !== null)
              insertAfter.after(droppedItemElement);

            updateKanbanItemService(itemId, {
              columnId,
              position: droppedIndex,
            });
          }
        }
      }
    });

    return dropZone;
  }

  public static createColumnDropZone(): HTMLDivElement {
    const range = document.createRange();
    range.selectNode(document.body);

    const dropZone = range.createContextualFragment(`
      <div class="kanban-column-dropzone"></div>
    `).children[0] as HTMLDivElement;

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();

      dropZone.classList.add("active");
    });

    dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dropZone.classList.remove("active");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      const jsonData = e.dataTransfer?.getData("text/plain");
      if (jsonData) {
        const dataTransfer = JSON.parse(jsonData);
        if (dataTransfer["className"] === "kanban-container") {
          dropZone.classList.remove("active");
          dropZone.classList.remove("active");

          const wrapperElement = dropZone.closest(
            ".kanban-wrapper"
          ) as HTMLDivElement;
          const id = dataTransfer["id"];
          const dropZoneElements = Array.from(
            wrapperElement.querySelectorAll(".kanban-column-dropzone")
          );
          const droppedIndex = dropZoneElements.indexOf(dropZone);

          if (id !== undefined) {
            const containerElement = document.querySelector<HTMLDivElement>(
              `[data-id="${id}"]`
            );
            const insertAfter = dropZone.parentElement;

            if (insertAfter !== null && containerElement !== null)
              insertAfter.after(containerElement);

            updateKanbanColumnService({ id, position: droppedIndex });
          }
        }
      }
    });

    return dropZone;
  }
}
