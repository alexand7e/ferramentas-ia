'use client';

import { useState, useEffect } from 'react';
import { AITool, ToolCategory, LicenseType, Language } from '@/types/ai-tool';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ToolFormProps {
  tool?: AITool | null;
  onSave: (tool: AITool) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  status: number | null;
  error?: string;
}

const CATEGORIES: ToolCategory[] = [
  "Escrita e Comunicação",
  "Web e Desenvolvimento",
  "Vídeo e Voz",
  "Design e Mídia Visual",
  "Educação",
  "Análise",
  "Automação e Agentes",
  "Multimodal"
];

const LICENSE_TYPES: LicenseType[] = [
  "Gratuito",
  "Gratuito e Pago",
  "Pago",
  "Pago (teste gratuito)"
];

const LANGUAGES: Language[] = [
  "PT",
  "EN",
  "ES",
  "FR",
  "DE",
  "Multilingue"
];

export default function ToolForm({ tool, onSave, onCancel, isLoading = false }: ToolFormProps) {
  const [formData, setFormData] = useState<Partial<AITool>>({
    name: '',
    description: '',
    link: '',
    icon: '',
    category: undefined,
    tags: [],
    license: 'Gratuito',
    usability: 3,
    features: [],
    languages: ['EN']
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [urlValidation, setUrlValidation] = useState<{
    link: ValidationResult;
    icon: ValidationResult;
  }>({ 
    link: { isValid: false, status: null }, 
    icon: { isValid: false, status: null } 
  });
  const [validatingUrls, setValidatingUrls] = useState({ link: false, icon: false });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (tool) {
      setFormData(tool);
      setTagsInput(tool.tags?.join(', ') || '');
    }
  }, [tool]);

  // Validar URL em tempo real
  const validateUrl = async (url: string, type: 'link' | 'icon') => {
    if (!url || !url.startsWith('http')) {
      setUrlValidation(prev => ({
        ...prev,
        [type]: { isValid: false, status: null, error: 'URL deve começar com http:// ou https://' }
      }));
      return;
    }

    setValidatingUrls(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      setUrlValidation(prev => ({
        ...prev,
        [type]: { isValid: true, status: response.status || 200 }
      }));
    } catch (error) {
      // Para URLs que bloqueiam CORS, assumimos que são válidas se não há erro de rede
      setUrlValidation(prev => ({
        ...prev,
        [type]: { isValid: true, status: null, error: 'Não foi possível validar (CORS)' }
      }));
    } finally {
      setValidatingUrls(prev => ({ ...prev, [type]: false }));
    }
  };

  // Debounce para validação de URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.link) {
        validateUrl(formData.link, 'link');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.link]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.icon) {
        validateUrl(formData.icon, 'icon');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.icon]);

  const handleInputChange = (field: keyof AITool, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.link?.trim()) {
      newErrors.link = 'Link é obrigatório';
    } else if (!formData.link.startsWith('http')) {
      newErrors.link = 'Link deve começar com http:// ou https://';
    }

    if (!formData.category?.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (formData.icon && !formData.icon.startsWith('http')) {
      newErrors.icon = 'Ícone deve ser uma URL válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const toolData: AITool = {
      id: tool?.id || '',
      name: formData.name!,
      description: formData.description!,
      link: formData.link!,
      icon: formData.icon || '',
      category: formData.category!,
      tags: formData.tags || [],
      license: formData.license || 'Gratuito',
      usability: formData.usability || 3,
      features: formData.features || [],
      languages: formData.languages || ['EN']
    };

    onSave(toolData);
  };

  const renderUrlStatus = (type: 'link' | 'icon') => {
    const validation = urlValidation[type];
    const isValidating = validatingUrls[type];
    
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (validation.error) {
      return (
        <div title={validation.error}>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </div>
      );
    }
    
    if (validation.isValid) {
      return (
        <div title={`Status: ${validation.status || 'OK'}`}>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {tool ? 'Editar Ferramenta' : 'Adicionar Nova Ferramenta'}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nome *</label>
            <Input
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome da ferramenta"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium mb-2 block">Descrição *</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição da ferramenta"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Link */}
          <div>
            <label className="text-sm font-medium mb-2 block">Link *</label>
            <div className="flex gap-2">
              <Input
                value={formData.link || ''}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://exemplo.com"
                className={errors.link ? 'border-red-500' : ''}
              />
              <div className="flex items-center gap-2">
                {renderUrlStatus('link')}
                {formData.link && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(formData.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {errors.link && (
              <p className="text-red-500 text-sm mt-1">{errors.link}</p>
            )}
          </div>

          {/* Ícone */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ícone (URL)</label>
            <div className="flex gap-2">
              <Input
                value={formData.icon || ''}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="https://exemplo.com/icone.png"
                className={errors.icon ? 'border-red-500' : ''}
              />
              <div className="flex items-center gap-2">
                {renderUrlStatus('icon')}
                {formData.icon && (
                  <img 
                    src={formData.icon} 
                    alt="Preview"
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
            {errors.icon && (
              <p className="text-red-500 text-sm mt-1">{errors.icon}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria *</label>
            <Select 
              value={formData.category || ''} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-sm text-gray-500 mt-1">Separe as tags com vírgulas</p>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preço */}
          <div>
            <label className="text-sm font-medium mb-2 block">Modelo de Preço</label>
            <Select 
              value={formData.license || 'Gratuito'}
                onValueChange={(value) => handleInputChange('license', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_TYPES.map((license) => (
                  <SelectItem key={license} value={license}>{license}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>



          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {tool ? 'Atualizar' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}