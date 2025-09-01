export interface AITool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  license: LicenseType;
  usability: number; // 1.0 to 5.0
  features: string[];
  tags: string[];
  languages: Language[];
  link: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ToolCategory = 
  | "Escrita e Comunicação"
  | "Web e Desenvolvimento"
  | "Vídeo e Voz"
  | "Design e Mídia Visual"
  | "Educação"
  | "Análise"
  | "Automação e Agentes"
  | "Multimodal";

export type LicenseType = 
  | "Gratuito"
  | "Gratuito e Pago"
  | "Pago"
  | "Pago (teste gratuito)";

export type Language = 
  | "PT" // Português
  | "EN" // English
  | "ES" // Español
  | "FR" // Français
  | "DE" // Deutsch
  | "Multilingue"

export interface FilterOptions {
  categories: ToolCategory[];
  licenses: LicenseType[];
  languages: Language[];
  searchQuery: string;
  minUsability: number;
  maxUsability: number;
}

export interface SortOptions {
  field: 'name' | 'usability' | 'createdAt' | 'category';
  direction: 'asc' | 'desc';
}

export interface FavoriteTool {
  toolId: string;
  addedAt: string;
}