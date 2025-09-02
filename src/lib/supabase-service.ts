import { supabase, SupabaseAITool } from './supabase';
import { AITool } from '@/types/ai-tool';

// Converter AITool para formato Supabase
function convertToSupabaseFormat(tool: AITool): Omit<SupabaseAITool, 'created_at' | 'updated_at'> {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    license: tool.license,
    usability: tool.usability,
    features: tool.features,
    tags: tool.tags,
    languages: tool.languages,
    link: tool.link,
    icon: tool.icon
  };
}

// Converter formato Supabase para AITool
function convertFromSupabaseFormat(supabaseTool: SupabaseAITool): AITool {
  return {
    id: supabaseTool.id,
    name: supabaseTool.name,
    description: supabaseTool.description,
    category: supabaseTool.category as any,
    license: supabaseTool.license as any,
    usability: supabaseTool.usability,
    features: supabaseTool.features,
    tags: supabaseTool.tags,
    languages: supabaseTool.languages as any,
    link: supabaseTool.link,
    icon: supabaseTool.icon,
    createdAt: supabaseTool.created_at.split('T')[0], // Converter para formato YYYY-MM-DD
    updatedAt: supabaseTool.updated_at.split('T')[0]
  };
}

export class SupabaseToolsService {
  // Listar todas as ferramentas
  static async getAllTools(): Promise<AITool[]> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw new Error(`Erro ao buscar ferramentas: ${error.message}`);
      }

      return data?.map(convertFromSupabaseFormat) || [];
    } catch (error) {
      console.error('Erro no getAllTools:', error);
      throw error;
    }
  }

  // Buscar ferramenta por ID
  static async getToolById(id: string): Promise<AITool | null> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        console.error('Erro ao buscar ferramenta:', error);
        throw new Error(`Erro ao buscar ferramenta: ${error.message}`);
      }

      return data ? convertFromSupabaseFormat(data) : null;
    } catch (error) {
      console.error('Erro no getToolById:', error);
      throw error;
    }
  }

  // Criar nova ferramenta
  static async createTool(tool: AITool): Promise<AITool> {
    try {
      const supabaseData = convertToSupabaseFormat(tool);
      
      const { data, error } = await supabase
        .from('ai_tools')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ferramenta:', error);
        if (error.code === '23505') {
          throw new Error('Já existe uma ferramenta com este nome');
        }
        throw new Error(`Erro ao criar ferramenta: ${error.message}`);
      }

      return convertFromSupabaseFormat(data);
    } catch (error) {
      console.error('Erro no createTool:', error);
      throw error;
    }
  }

  // Atualizar ferramenta existente
  static async updateTool(id: string, updates: Partial<AITool>): Promise<AITool> {
    try {
      // Remover campos que não devem ser atualizados
      const { id: _, createdAt, updatedAt, ...updateData } = updates;
      const supabaseUpdates = convertToSupabaseFormat({ id, ...updateData } as AITool);
      
      // Remover o ID dos updates
      const { id: __, ...finalUpdates } = supabaseUpdates;

      const { data, error } = await supabase
        .from('ai_tools')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar ferramenta:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Ferramenta não encontrada');
        }
        if (error.code === '23505') {
          throw new Error('Já existe uma ferramenta com este nome');
        }
        throw new Error(`Erro ao atualizar ferramenta: ${error.message}`);
      }

      return convertFromSupabaseFormat(data);
    } catch (error) {
      console.error('Erro no updateTool:', error);
      throw error;
    }
  }

  // Deletar ferramenta
  static async deleteTool(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar ferramenta:', error);
        throw new Error(`Erro ao deletar ferramenta: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erro no deleteTool:', error);
      throw error;
    }
  }

  // Buscar ferramentas por categoria
  static async getToolsByCategory(category: string): Promise<AITool[]> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        console.error('Erro ao buscar ferramentas por categoria:', error);
        throw new Error(`Erro ao buscar ferramentas: ${error.message}`);
      }

      return data?.map(convertFromSupabaseFormat) || [];
    } catch (error) {
      console.error('Erro no getToolsByCategory:', error);
      throw error;
    }
  }

  // Buscar ferramentas por texto
  static async searchTools(query: string): Promise<AITool[]> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw new Error(`Erro ao buscar ferramentas: ${error.message}`);
      }

      return data?.map(convertFromSupabaseFormat) || [];
    } catch (error) {
      console.error('Erro no searchTools:', error);
      throw error;
    }
  }

  // Contar total de ferramentas
  static async getToolsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('ai_tools')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Erro ao contar ferramentas:', error);
        throw new Error(`Erro ao contar ferramentas: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Erro no getToolsCount:', error);
      throw error;
    }
  }
}