export interface Track {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  uri: string;
  provider: 'local' | 'spotify';
  album?: string;
  coverArt?: string;
}
