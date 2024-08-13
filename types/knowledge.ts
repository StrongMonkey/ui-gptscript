export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  ready?: boolean;
  topK: number;
  chunkSize: number;
  chunkOverlapSize: number;
  config: string;
  files: string[];
  error?: string;
}
