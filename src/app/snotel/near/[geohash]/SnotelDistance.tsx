import type { QueryResultRow } from "pg";

export interface SnotelDistance extends QueryResultRow {
  id: string;
  name: string;
  dist: number;
  bearing: number;
  state: string;
}
