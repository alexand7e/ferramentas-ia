'use client';

import { useState, useEffect, useMemo } from 'react';
import { AITool } from '@/types/ai-tool';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ToolsListProps {
  onEdit: (tool: AITool) => void;
  onDelete: (tool: AITool) => void;
  onAdd: () => void;
  onStatsUpdate?: () => void;
}

interface URLStatus {
  [key: string]: {
    linkStatus: 'success' | 'error' | 'unknown';
    iconStatus: 'success' | 'error' | 'unknown';
  };
}

export default function ToolsList({ onEdit, onDelete, onAdd, onStatsUpdate }: ToolsListProps) {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urlStatuses, setUrlStatuses] = useState<URLStatus>({});

  // Carregar ferramentas
  const loadTools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tools', {
        headers: {
          'Authorization': 'Bearer admin-authenticated'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar ferramentas');
      }
      
      const data = await response.json();
      setTools(data.tools);
    } catch (err) {
      setError('Erro ao carregar ferramentas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar status das URLs
  const loadUrlStatuses = async () => {
    try {
      const response = await fetch('/api/admin/url-report', {
        headers: {
          'Authorization': 'Bearer admin-authenticated'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const statuses: URLStatus = {};
        
        // Processar resultados do relatório
        data.results?.forEach((result: any) => {
          const toolId = findToolIdByUrl(result.url);
          if (toolId) {
            if (!statuses[toolId]) {
              statuses[toolId] = { linkStatus: 'unknown', iconStatus: 'unknown' };
            }
            
            if (result.type === 'link') {
              statuses[toolId].linkStatus = result.success ? 'success' : 'error';
            } else if (result.type === 'icon') {
              statuses[toolId].iconStatus = result.success ? 'success' : 'error';
            }
          }
        });
        
        setUrlStatuses(statuses);
      }
    } catch (err) {
      console.error('Erro ao carregar status das URLs:', err);
    }
  };

  // Encontrar ID da ferramenta pela URL
  const findToolIdByUrl = (url: string): string | null => {
    const tool = tools.find(t => t.link === url || t.icon === url);
    return tool?.id || null;
  };

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    if (tools.length > 0) {
      loadUrlStatuses();
    }
  }, [tools]);

  // Filtrar ferramentas
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const status = urlStatuses[tool.id];
        if (statusFilter === 'error') {
          matchesStatus = status?.linkStatus === 'error' || status?.iconStatus === 'error';
        } else if (statusFilter === 'success') {
          matchesStatus = status?.linkStatus === 'success' && status?.iconStatus === 'success';
        }
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tools, searchTerm, categoryFilter, statusFilter, urlStatuses]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const cats = [...new Set(tools.map(tool => tool.category))];
    return cats.sort();
  }, [tools]);

  // Renderizar status da URL
  const renderUrlStatus = (toolId: string, type: 'link' | 'icon') => {
    const status = urlStatuses[toolId];
    const urlStatus = type === 'link' ? status?.linkStatus : status?.iconStatus;
    
    switch (urlStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Ferramentas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTools.length} de {tools.length} ferramentas
          </p>
        </div>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Ferramenta
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status das URLs</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="success">URLs funcionando</SelectItem>
                  <SelectItem value="error">URLs com problemas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagens de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabela de ferramentas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Status URLs</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {tool.icon && (
                        <img 
                          src={tool.icon} 
                          alt={tool.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-icon.svg';
                          }}
                        />
                      )}
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-gray-500">ID: {tool.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tool.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={tool.description}>
                      {tool.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center gap-1" title="Status do Link">
                        <span className="text-xs">Link:</span>
                        {renderUrlStatus(tool.id, 'link')}
                      </div>
                      <div className="flex items-center gap-1" title="Status do Ícone">
                        <span className="text-xs">Ícone:</span>
                        {renderUrlStatus(tool.id, 'icon')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(tool.link, '_blank')}
                        title="Abrir ferramenta"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(tool)}
                        title="Editar ferramenta"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(tool)}
                        title="Excluir ferramenta"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTools.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma ferramenta encontrada com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}