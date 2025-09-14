import { AITool } from '@/types/ai-tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, Star } from 'lucide-react';

// Cores personalizadas para diferentes tipos de licença
// Escolhidas para dar feedback visual imediato sobre custos

interface ToolCardProps {
  tool: AITool;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onClick: () => void;
  viewMode: 'grid' | 'list';
}

const LICENSE_COLORS: Record<string, string> = {
  'Gratuito': 'bg-green-100 text-green-800 hover:bg-green-200',
  'Gratuito e Pago': 'bg-blue-100 text-blue-800 hover:bg-blue-200', 
  'Pago': 'bg-red-100 text-red-800 hover:bg-red-200',
  'Pago (teste gratuito)': 'bg-orange-100 text-orange-800 hover:bg-orange-200'
};

// Sistema de cores por categoria - ajuda usuários a navegar visualmente

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

export function ToolCard({ tool, isFavorite, onFavoriteToggle, onClick, viewMode }: ToolCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle();
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(tool.link, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 relative">
                <img
                  src={tool.icon || '/placeholder-icon.svg'}
                  alt={tool.name}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-icon.svg';
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold truncate">{tool.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{tool.usability}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteClick}
                    className="p-1 h-auto"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {tool.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={CATEGORY_COLORS[tool.category] || ''}>
                    {tool.category}
                  </Badge>
                  <Badge className={LICENSE_COLORS[tool.license] || ''}>
                    {tool.license}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExternalLinkClick}
                  className="p-1 h-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 relative">
            <img
              src={tool.icon || '/placeholder-icon.svg'}
              alt={tool.name}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-icon.svg';
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        
        <CardTitle className="text-lg leading-tight line-clamp-1">
          {tool.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {tool.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Usability Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{tool.usability}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExternalLinkClick}
              className="p-1 h-auto"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Category and License */}
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="secondary" 
              className={CATEGORY_COLORS[tool.category] || ''}
            >
              {tool.category}
            </Badge>
            <Badge 
              variant="secondary" 
              className={LICENSE_COLORS[tool.license] || ''}
            >
              {tool.license}
            </Badge>
          </div>
          
          {/* Languages */}
          <div className="flex flex-wrap gap-1">
            {tool.languages.slice(0, 3).map(lang => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
            {tool.languages.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tool.languages.length - 3}
              </Badge>
            )}
          </div>
          
          {/* Features Preview */}
          <div className="space-y-1">
            {tool.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
            {tool.features.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{tool.features.length - 2} mais funcionalidades
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}