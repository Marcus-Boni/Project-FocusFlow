"use client";

import { useEffect, useState } from "react";
import {
  StandardizedArticle,
  fetchArticlesForDevelopers,
  formatPublishedDate,
} from "@/lib/external-content-service";
import {
  ExternalLink,
  Clock,
  User,
  Tag,
  Newspaper,
  RefreshCw,
  Filter,
} from "lucide-react";

interface NewsWidgetProps {
  maxArticles?: number;
  showFilters?: boolean;
}

export function NewsWidget({
  maxArticles = 20,
  showFilters = true,
}: NewsWidgetProps) {
  const [articles, setArticles] = useState<StandardizedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedArticles = await fetchArticlesForDevelopers();
      setArticles(fetchedArticles.slice(0, maxArticles));
    } catch (err) {
      setError("Erro ao carregar notícias. Tente novamente.");
      console.error("Error fetching news:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedArticles = await fetchArticlesForDevelopers();
        setArticles(fetchedArticles.slice(0, maxArticles));
      } catch (err) {
        setError("Erro ao carregar notícias. Tente novamente.");
        console.error("Error fetching news:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [maxArticles]);

  // Filtrar artigos baseado nas seleções
  const filteredArticles = articles.filter((article) => {
    const sourceMatch =
      selectedSource === "all" || article.source === selectedSource;
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.some(
        (tag) =>
          article.tags?.some((articleTag) =>
            articleTag.toLowerCase().includes(tag.toLowerCase())
          ) || article.title.toLowerCase().includes(tag.toLowerCase())
      );
    return sourceMatch && tagMatch;
  });

  // Obter fontes únicas
  const uniqueSources = [
    "all",
    ...Array.from(new Set(articles.map((a) => a.source))),
  ];

  // Tags populares para filtro
  const popularTags = [
    "javascript",
    "typescript",
    "react",
    "python",
    "webdev",
    "tutorial",
    "aws",
    "docker",
    "api",
    "database",
    "ai",
    "machine learning",
  ];

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "dev.to":
        return "💻";
      case "hacker news":
        return "🔥";
      case "github blog":
        return "⚡";
      default:
        return "📰";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case "dev.to":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "hacker news":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "github blog":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Newspaper className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Tech News</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Newspaper className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Tech News</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchNews}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Tech News</h2>
          <span className="text-sm text-muted-foreground">
            ({filteredArticles.length} artigos)
          </span>
        </div>
        <button
          onClick={fetchNews}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          title="Atualizar notícias"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Source Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fonte:</label>
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-md bg-background text-foreground appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent"
                aria-label="Selecionar fonte"
              >
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source === "all" ? "Todas as fontes" : source}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tags populares:
            </label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-muted-foreground hover:text-foreground mt-2"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum artigo encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <article
              key={`${article.source}-${article.id}`}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
            >
              {/* Article Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {article.title}
                  </a>
                </h3>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>

              {/* Article Description */}
              {article.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {article.description}
                </p>
              )}

              {/* Article Meta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatPublishedDate(article.publishedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span className="max-w-20 truncate">
                        {article.tags[0]}
                      </span>
                      {article.tags.length > 1 && (
                        <span>+{article.tags.length - 1}</span>
                      )}
                    </div>
                  )}

                  {/* Source Badge */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(
                      article.source
                    )}`}
                  >
                    {getSourceIcon(article.source)} {article.source}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Fontes: Dev.to, Hacker News, GitHub Blog, Medium
        </p>
      </div>
    </div>
  );
}
