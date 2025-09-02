'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

interface URLTestResult {
  url: string;
  normalizedUrl: string;
  status: number;
  success: boolean;
  error: string | null;
  type: 'link' | 'icon';
}

interface URLReportData {
  summary: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    lastUpdated: string;
  };
  failedUrls: URLTestResult[];
  successfulUrls: URLTestResult[];
  linkResults: URLTestResult[];
  iconResults: URLTestResult[];
}

export default function URLReport() {
  const [reportData, setReportData] = useState<URLReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const url = `/api/admin/url-report${refresh ? '?refresh=true' : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer admin-authenticated'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.needsRefresh) {
          setError('Nenhum relatório encontrado. Execute um teste primeiro.');
        } else {
          throw new Error(errorData.error || 'Erro ao carregar relatório');
        }
        return;
      }
      
      const data = await response.json();
      setReportData(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar relatório de URLs');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const runNewTest = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/url-report', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-authenticated'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao executar teste');
      }
      
      // Recarregar dados após o teste
      await loadReport();
    } catch (err) {
      setError('Erro ao executar novo teste');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-red-600';
    if (status >= 500) return 'text-red-800';
    return 'text-yellow-600';
  };

  const renderUrlRow = (result: URLTestResult, index: number) => (
    <TableRow key={index}>
      <TableCell>
        <Badge variant={result.type === 'link' ? 'default' : 'secondary'}>
          {result.type.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate" title={result.url}>
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            {result.url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={getStatusColor(result.status)}>
            {result.status}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {result.error && (
          <span className="text-red-600 text-sm">{result.error}</span>
        )}
      </TableCell>
    </TableRow>
  );

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
          <h2 className="text-2xl font-bold">Relatório de URLs</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Status das URLs das ferramentas cadastradas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => loadReport(true)} 
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Button 
            onClick={runNewTest} 
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            Executar Novo Teste
          </Button>
        </div>
      </div>

      {/* Mensagens de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {reportData && (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Funcionando</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {reportData.summary.successful}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Com Problemas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">
                    {reportData.summary.failed}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.summary.successRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Última atualização */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Última atualização: {formatDate(reportData.summary.lastUpdated)}
              </div>
            </CardContent>
          </Card>

          {/* Tabs com detalhes */}
          <Tabs defaultValue="failed" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="failed">
                URLs com Problemas ({reportData.failedUrls.length})
              </TabsTrigger>
              <TabsTrigger value="successful">
                URLs Funcionando ({reportData.successfulUrls.length})
              </TabsTrigger>
              <TabsTrigger value="links">
                Links ({reportData.linkResults.length})
              </TabsTrigger>
              <TabsTrigger value="icons">
                Ícones ({reportData.iconResults.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="failed" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    URLs com Problemas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.failedUrls.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Erro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.failedUrls.map((result, index) => renderUrlRow(result, index))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      🎉 Todas as URLs estão funcionando!
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="successful" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    URLs Funcionando
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.successfulUrls.slice(0, 50).map((result, index) => renderUrlRow(result, index))}
                    </TableBody>
                  </Table>
                  {reportData.successfulUrls.length > 50 && (
                    <div className="text-center py-4 text-gray-500">
                      ... e mais {reportData.successfulUrls.length - 50} URLs funcionando
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="links" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Links das Ferramentas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.linkResults.map((result, index) => renderUrlRow(result, index))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="icons" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ícones das Ferramentas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.iconResults.map((result, index) => renderUrlRow(result, index))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}