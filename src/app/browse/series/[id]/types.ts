export type Content = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  type: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  rating: string | null;
  aiProfile: string | null;
  categories: { category: { name: string } }[];
  episodes: { id: string; season: number; number: number; title: string; videoUrl: string; duration: number | null }[];
};
