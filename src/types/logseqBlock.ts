export type LogseqPageIdenity = {
  name: string;
  id: number;
  uuid: string;
  originalName?: string;
  'journal-day'?: number; // YYYYMMDD format, only present for journal pages
};

export type LogseqBlockType = {
  uuid: string;
  html: string;
  page: LogseqPageIdenity;
  content: string;
  format: string;
  marker: string;
  priority: string;
  properties?: Record<string, any>; // DB graph properties
  tags?: string[]; // DB graph tags
  status?: string; // Task status for DB graphs (extracted from properties)
};

export type LogseqPageContentType = {
  uuid: string;
  content: string;
  page: LogseqPageIdenity;
};

export type LogseqSearchResult = {
  blocks: LogseqBlockType[];
  pages: LogseqPageIdenity[];
  // pageContents: LogseqPageContentType[];
  graph: string;
};
