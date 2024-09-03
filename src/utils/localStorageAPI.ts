export type SaveLocalStorageProps<T> = {
  key: string;
  data: T;
};

export const readLocalStorage = <T>(item: string): T | null => {
  const data = localStorage.getItem(item);

  if (data !== null) {
    return JSON.parse(data);
  }

  return null;
};

export const saveLocalStorage = <T>({
  key,
  data,
}: SaveLocalStorageProps<T>) => {
  localStorage.setItem(key, JSON.stringify(data));
};
