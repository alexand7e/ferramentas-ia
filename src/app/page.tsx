"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Heart, Share2, Star, Grid, List, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { AITool, ToolCategory, LicenseType, Language, FilterOptions, SortOptions } from '@/types/ai-tool';
import { aiToolsData } from '@/data/ai-tools';
import { useFavoritesStore } from '@/stores/favorites';
import { ToolCard } from '@/components/tool-card';
import { ToolDetailModal } from '@/components/tool-detail-modal';

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

const LICENSES: LicenseType[] = [
  "Gratuito",
  "Gratuito e Pago",
  "Pago",
  "Pago (teste gratuito)"
];

const LANGUAGES: Language[] = ["PT", "EN", "ES", "FR", "DE", "Multilingue"];

const LANGUAGE_NAMES: Record<Language, string> = {
  PT: "Português",
  EN: "English",
  ES: "Español",
  FR: "Français",
  DE: "Deutsch",
  Multilingue: "Multilingue"
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState<AITool[]>(aiToolsData);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    licenses: [],
    languages: [],
    searchQuery: '',
    minUsability: 1,
    maxUsability: 5
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc'
  });

  const { theme, setTheme } = useTheme();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  // Aplicar filtros e ordenação
  useEffect(() => {
    let filtered = aiToolsData;

    // Filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query)) ||
        tool.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Filtro de categoria
    if (filters.categories.length > 0) {
      filtered = filtered.filter(tool => filters.categories.includes(tool.category));
    }

    // Filtro de licença
    if (filters.licenses.length > 0) {
      filtered = filtered.filter(tool => filters.licenses.includes(tool.license));
    }

    // Filtro de idioma
    if (filters.languages.length > 0) {
      filtered = filtered.filter(tool => 
        tool.languages.some(lang => filters.languages.includes(lang))
      );
    }

    // Filtro de usabilidade
    filtered = filtered.filter(tool => 
      tool.usability >= filters.minUsability && tool.usability <= filters.maxUsability
    );

    // Filtro de favoritos
    if (showFavoritesOnly) {
      filtered = filtered.filter(tool => isFavorite(tool.id));
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortOptions.field];
      let bValue: any = b[sortOptions.field];

      if (sortOptions.field === 'createdAt') {
        aValue = new Date(aValue || '').getTime();
        bValue = new Date(bValue || '').getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTools(filtered);
  }, [searchQuery, filters, sortOptions, showFavoritesOnly, isFavorite]);

  const handleToolClick = (tool: AITool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const handleFavoriteToggle = (toolId: string) => {
    if (isFavorite(toolId)) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      licenses: [],
      languages: [],
      searchQuery: '',
      minUsability: 1,
      maxUsability: 5
    });
    setSearchQuery('');
  };

  const toggleCategory = (category: ToolCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleLicense = (license: LicenseType) => {
    setFilters(prev => ({
      ...prev,
      licenses: prev.licenses.includes(license)
        ? prev.licenses.filter(l => l !== license)
        : [...prev.licenses, license]
    }));
  };

  const toggleLanguage = (language: Language) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">SIA Piauí</h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Hub de Ferramentas de IA
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favoritos ({favorites.length})
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                <span className="hidden dark:inline"><Sun className="w-4 h-4" /></span>
                <span className="inline dark:hidden"><Moon className="w-4 h-4" /></span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar ferramentas de IA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {(filters.categories.length > 0 || filters.licenses.length > 0 || filters.languages.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.categories.length + filters.licenses.length + filters.languages.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Refine sua busca por ferramentas de IA
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium mb-3">Categorias</h3>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(category => (
                        <Badge
                          key={category}
                          variant={filters.categories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Licenses */}
                  <div>
                    <h3 className="font-medium mb-3">Licença</h3>
                    <div className="flex flex-wrap gap-2">
                      {LICENSES.map(license => (
                        <Badge
                          key={license}
                          variant={filters.licenses.includes(license) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleLicense(license)}
                        >
                          {license}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h3 className="font-medium mb-3">Idiomas</h3>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map(language => (
                        <Badge
                          key={language}
                          variant={filters.languages.includes(language) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleLanguage(language)}
                        >
                          {LANGUAGE_NAMES[language]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Usability Range */}
                  <div>
                    <h3 className="font-medium mb-3">
                      Usabilidade: {filters.minUsability} - {filters.maxUsability}
                    </h3>
                    <Slider
                      value={[filters.minUsability, filters.maxUsability]}
                      onValueChange={(value) => {
                        setFilters(prev => ({
                          ...prev,
                          minUsability: value[0],
                          maxUsability: value[1]
                        }));
                      }}
                      max={5}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Select
              value={`${sortOptions.field}-${sortOptions.direction}`}
              onValueChange={(value) => {
                const [field, direction] = value.split('-') as [SortOptions['field'], SortOptions['direction']];
                setSortOptions({ field, direction });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                <SelectItem value="usability-desc">Usabilidade (Maior)</SelectItem>
                <SelectItem value="usability-asc">Usabilidade (Menor)</SelectItem>
                <SelectItem value="category-asc">Categoria (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredTools.length} ferramenta{filteredTools.length !== 1 ? 's' : ''} encontrada{filteredTools.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma ferramenta encontrada com os filtros atuais.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={isFavorite(tool.id)}
                onFavoriteToggle={() => handleFavoriteToggle(tool.id)}
                onClick={() => handleToolClick(tool)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tool Detail Modal */}
      {selectedTool && (
        <ToolDetailModal
          tool={selectedTool}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isFavorite={isFavorite(selectedTool.id)}
          onFavoriteToggle={() => handleFavoriteToggle(selectedTool.id)}
        />
      )}
    </div>
  );
}