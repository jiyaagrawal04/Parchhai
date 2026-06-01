export interface BannerDTO {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  placement: string;
  position: number;
}

export interface CollectionDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroImage: string | null;
}

export interface JournalPostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  author: string | null;
  tags: string[];
  publishedAt: string | null;
}
