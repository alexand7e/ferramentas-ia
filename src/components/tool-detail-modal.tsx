import { AITool } from '@/types/ai-tool';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  ExternalLink, 
  Share2, 
  Star, 
  Globe, 
  Tag, 
  CheckCircle,
  Calendar,
  Copy
} from 'lucide-react';
import { useState } from 'react';

interface ToolDetailModalProps {
  tool: AITool;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

const LICENSE_COLORS: Record<string, string> = {
  'Gratuito': 'bg-green-100 text-green-800',
  'Gratuito e Pago': 'bg-blue-100 text-blue-800',
  'Pago': 'bg-red-100 text-red-800',
  'Pago (teste gratuito)': 'bg-orange-100 text-orange-800'
};

const CATEGORY_COLORS: Record<string, string> = {
  'Escrita e Comunicação': 'bg-purple-100 text-purple-800',
  'Web e Desenvolvimento': 'bg-blue-100 text-blue-800',
  'Vídeo e Voz': 'bg-pink-100 text-pink-800',
  'Design e Mídia Visual': 'bg-green-100 text-green-800',
  'Educação': 'bg-yellow-100 text-yellow-800',
  'Análise': 'bg-indigo-100 text-indigo-800',
  'Automação e Agentes': 'bg-gray-100 text-gray-800',
  'Multimodal': 'bg-teal-100 text-teal-800'
};

const LANGUAGE_NAMES: Record<string, string> = {
  PT: "Português",
  EN: "English",
  ES: "Español",
  FR: "Français",
  DE: "Deutsch",
  IT: "Italiano",
  ZH: "中文",
  JA: "日本語",
  KO: "한국어",
  RU: "Русский"
};

export function ToolDetailModal({ 
  tool, 
  isOpen, 
  onClose, 
  isFavorite, 
  onFavoriteToggle 
}: ToolDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool.name,
          text: tool.description,
          url: url,
        });
      } catch (error) {
        // Alternativa: copiar para a área de transferência
        await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleExternalLink = () => {
    window.open(tool.link, '_blank');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle();
  };

  const renderStars = (rating: number): React.ReactNode[] => {
    const stars: React.ReactNode[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 relative flex-shrink-0">
                <img
                  src={tool.icon}
                  alt={tool.name}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-icon.svg';
                  }}
                />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold pr-8">
                  {tool.name}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {tool.description}
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="relative"
              >
                {copied ? (
                  <Copy className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span className="ml-2">
                  {copied ? 'Copiado!' : 'Compartilhar'}
                </span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavoriteClick}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Remover' : 'Favoritar'}
              </Button>
              
              <Button
                onClick={handleExternalLink}
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Usabilidade</p>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(tool.usability)}
                  </div>
                  <span className="text-lg font-bold">{tool.usability}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Categoria</p>
                <Badge className={`${CATEGORY_COLORS[tool.category] || ''} whitespace-normal text-center h-auto py-1`}>
                  {tool.category}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Licença</p>
                <Badge className={`${LICENSE_COLORS[tool.license] || ''} whitespace-normal text-center h-auto py-1`}>
                  {tool.license}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              Funcionalidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tool.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm break-words">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Languages */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Globe className="w-5 h-5 mr-2 flex-shrink-0" />
              Idiomas Suportados
            </h3>
            <div className="flex flex-wrap gap-2">
              {tool.languages.map(lang => (
                <Badge key={lang} variant="outline" className="whitespace-normal text-center h-auto py-1">
                  {LANGUAGE_NAMES[lang] || lang}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Tag className="w-5 h-5 mr-2 flex-shrink-0" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="whitespace-normal text-center h-auto py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          {tool.createdAt && (
            <>
              <Separator />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Adicionado em {new Date(tool.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={handleFavoriteClick}
              className="flex-1"
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </Button>
            
            <Button
              onClick={handleExternalLink}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visitar Site
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}