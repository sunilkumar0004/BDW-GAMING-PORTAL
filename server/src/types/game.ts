export interface DownloadLinks {
  playStore?: string;
  appStore?: string;
  pc?: string;
  steam?: string;
  epicGames?: string;
}

export interface Game {
  id: string;
  title: string;
  image: string;
  url: string;
  category: string;
  description?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  type?: 'browser' | 'mobile' | 'download';
  trailer?: string;
  screenshots?: string[];
  rating?: number;
  developer?: string;
  platforms?: string[];
  downloads?: string;
  size?: string;
  released?: string;
  downloadLinks?: DownloadLinks;
  tags?: string[];
  players?: string;
}

export interface GamesResponse {
  games: Game[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  count: number;
}
