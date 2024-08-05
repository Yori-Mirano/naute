export interface Note {
  id?: string;
  createdAt: number;
  updatedAt?: number;
  content: string;
  cache: {
    title: string;
    tags: Array<string>;
  }
}
