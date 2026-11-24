export type StoryKind = "posts" | "press";
export type MediaKind = StoryKind | "videos";

export type MediaPost = {
  id: number;
  title: string;
  description: string;
  date: string;
  featured_image: string;
  link: string;
  press_coverage_link: string;
  youtubeId: string;
  duration: string;
};

export type MediaList = {
  items: MediaPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
};

export type MediaNeighbor = {
  id: number;
  title: string;
  link: string;
};

export type MediaArticle = {
  post: {
    id: number;
    title: string;
    description: string;
    featuredImage: string;
  };
  previous: MediaNeighbor | null;
  next: MediaNeighbor | null;
};
