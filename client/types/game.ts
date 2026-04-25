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
  // Advanced fields
  type?: 'browser' | 'mobile' | 'download'; // 'browser' plays in iframe
  trailer?: string;           // YouTube video ID
  screenshots?: string[];     // Extra screenshot URLs
  rating?: number;            // 0–5
  developer?: string;
  platforms?: string[];       // ['mobile','pc','browser','ps5','xbox']
  downloads?: string;         // "100M+"
  size?: string;              // "2.5 GB"
  released?: string;          // "2021"
  downloadLinks?: DownloadLinks;
  tags?: string[];
  players?: string;           // "100M+ Players"
  reviewCount?: number;       // Number of reviews
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
