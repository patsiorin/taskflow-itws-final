// Domain type used by the app to describe a board independent of HTTP details.
export type BoardEntity = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};
