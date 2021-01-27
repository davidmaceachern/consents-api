export interface Event {
  id: string;
  title: string;
  body: string;
  created_at: Date;
  authorId: string;
  categoryId: string;
  cheers: number;
}