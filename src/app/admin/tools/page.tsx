'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, Link, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import ToolsList from '@/components/admin/tools-list';
import URLReport from '@/components/admin/url-report';
import ToolForm from '@/components/admin/tool-form';
import { AITool } from '@/types/ai-tool';

export default function AdminToolsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTools: 0,
    totalUrls: 0,
    workingUrls: 0,
    brokenUrls: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Verificar se já está autenticado
    const authenticated = sessionStorage.getItem('admin-authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-authenticated', 'true');
      setError('');
      loadStats();
    } else {
      setError('Senha incorreta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-authenticated');
    setPassword('');
  };

  const loadStats = async () => {
    try {
      // Carregar estatísticas das ferramentas
      const toolsResponse = await fetch('/api/admin/tools', {
        headers: {
          'Authorization': 'Bearer admin-authenticated'
        }
      });
      
      if (toolsResponse.ok) {
        const data = await toolsResponse.json();
        setStats(prev => ({ ...prev, totalTools: data.total || data.tools?.length || 0 }));
      }

      // Carregar estatísticas das URLs
      const urlResponse = await fetch('/api/admin/url-report', {
        headers: {
          'Authorization': 'Bearer admin-authenticated'
        }
      });
      
      if (urlResponse.ok) {
        const urlData = await urlResponse.json();
        setStats(prev => ({
          ...prev,
          totalUrls: urlData.summary.total,
          workingUrls: urlData.summary.successful,
          brokenUrls: urlData.summary.failed
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleAddTool = () => {
    setEditingTool(null);
    setShowForm(true);
    setFormError('');
  };

  const handleEditTool = (tool: AITool) => {
    setEditingTool(tool);
    setShowForm(true);
    setFormError('');
  };

  const handleDeleteTool = async (tool: AITool) => {
    if (!confirm(`Tem certeza que deseja excluir a ferramenta "${tool.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tools-supabase/${tool.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-authenticated'
        }
      });

      if (response.ok) {
        loadStats();
      } else {
        setFormError('Erro ao excluir ferramenta');
      }
    } catch (err) {
      console.error('Erro ao excluir ferramenta:', err);
      setFormError('Erro ao excluir ferramenta');
    }
  };

  const handleSaveTool = async (toolData: AITool) => {
    try {
      const isEditing = !!editingTool;
      const url = isEditing ? `/api/admin/tools-supabase/${toolData.id}` : '/api/admin/tools-supabase';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-authenticated'
        },
        body: JSON.stringify(toolData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingTool(null);
        setFormError('');
        loadStats();
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Erro ao salvar ferramenta');
      }
    } catch (err) {
      console.error('Erro ao salvar ferramenta:', err);
      setFormError('Erro ao salvar ferramenta');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTool(null);
    setFormError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle>Acesso Administrativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as ferramentas de IA e monitore o status das URLs
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Sair
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Ferramentas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalTools}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">{stats.totalUrls}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">URLs Funcionando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-2xl font-bold text-green-600">{stats.workingUrls}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">URLs com Problemas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{stats.brokenUrls}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar Ferramentas
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatório de URLs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="mt-6">
          {showForm ? (
            <div className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <ToolForm
                tool={editingTool}
                onSave={handleSaveTool}
                onCancel={handleCancelForm}
              />
            </div>
          ) : (
            <ToolsList
              onAdd={handleAddTool}
              onEdit={handleEditTool}
              onDelete={handleDeleteTool}
              onStatsUpdate={loadStats}
            />
          )}
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <URLReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}