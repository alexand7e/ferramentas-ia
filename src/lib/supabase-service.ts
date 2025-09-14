import { supabase } from './supabase';
import { AITool, ToolCategory, LicenseType, Language } from '@/types/ai-tool';

export interface SupabaseAITool {
  id: string;
  name: string;
  description: string;
  category: string;
  license: string;
  usability: number;
  features: string[];
  tags: string[];
  languages: string[];
  link: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  static async getAllTools(): Promise<AITool[]> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }

      return data ? data.map(this.mapSupabaseToAITool) : [];
    } catch (error) {
      console.error('Erro na função getAllTools:', error);
      throw error;
    }
  }

  static async getToolById(id: string): Promise<AITool | null> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Ferramenta não encontrada
        }
        console.error('Erro ao buscar ferramenta:', error);
        throw new Error('Falha ao buscar ferramenta');
      }

      return this.mapSupabaseToAITool(data);
    } catch (error) {
      console.error('Erro na função getToolById:', error);
      throw error;
    }
  }

  static async createTool(tool: Omit<AITool, 'id' | 'createdAt' | 'updatedAt'>): Promise<AITool> {
    try {
      const now = new Date().toISOString();
      const newTool: AITool = {
        ...tool,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };

      const supabaseTool = this.mapAIToolToSupabase(newTool);

      const { data, error } = await supabase
        .from('ai_tools')
        .insert(supabaseTool)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ferramenta:', error);
        throw new Error('Falha ao criar ferramenta');
      }

      return this.mapSupabaseToAITool(data);
    } catch (error) {
      console.error('Erro na função createTool:', error);
      throw error;
    }
  }

  static async updateTool(id: string, updates: Partial<Omit<AITool, 'id' | 'createdAt'>>): Promise<AITool> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const supabaseUpdates = this.mapAIToolToSupabase(updatedData as AITool);
      
      // Remove campos que não devem ser atualizados
      delete supabaseUpdates.id;
      delete supabaseUpdates.created_at;

      const { data, error } = await supabase
        .from('ai_tools')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar ferramenta:', error);
        throw new Error('Falha ao atualizar ferramenta');
      }

      return this.mapSupabaseToAITool(data);
    } catch (error) {
      console.error('Erro na função updateTool:', error);
      throw error;
    }
  }

  static async deleteTool(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar ferramenta:', error);
        throw new Error('Falha ao deletar ferramenta');
      }
    } catch (error) {
      console.error('Erro na função deleteTool:', error);
      throw error;
    }
  }

  private static mapSupabaseToAITool(supabaseTool: SupabaseAITool): AITool {
    return {
      id: supabaseTool.id,
      name: supabaseTool.name,
      description: supabaseTool.description,
      category: supabaseTool.category as ToolCategory,
      license: supabaseTool.license as LicenseType,
      usability: supabaseTool.usability,
      features: supabaseTool.features,
      tags: supabaseTool.tags,
      languages: supabaseTool.languages as Language[],
      link: supabaseTool.link,
      icon: supabaseTool.icon,
      createdAt: supabaseTool.created_at,
      updatedAt: supabaseTool.updated_at,
    };
  }

  private static mapAIToolToSupabase(aiTool: Partial<AITool>): Partial<SupabaseAITool> {
    const mapped: Partial<SupabaseAITool> = {};
    
    if (aiTool.id) mapped.id = aiTool.id;
    if (aiTool.name) mapped.name = aiTool.name;
    if (aiTool.description) mapped.description = aiTool.description;
    if (aiTool.category) mapped.category = aiTool.category;
    if (aiTool.license) mapped.license = aiTool.license;
    if (aiTool.usability !== undefined) mapped.usability = aiTool.usability;
    if (aiTool.features) mapped.features = aiTool.features;
    if (aiTool.tags) mapped.tags = aiTool.tags;
    if (aiTool.languages) mapped.languages = aiTool.languages;
    if (aiTool.link) mapped.link = aiTool.link;
    if (aiTool.icon) mapped.icon = aiTool.icon;
    if (aiTool.createdAt) mapped.created_at = aiTool.createdAt;
    if (aiTool.updatedAt) mapped.updated_at = aiTool.updatedAt;
    
    return mapped;
  }
}