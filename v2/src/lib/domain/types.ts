export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  image?: string | null;
  skills?: string | null; // Comma separated
  lat?: number | null; // Converted from decimal
  long?: number | null;
  bio?: string | null;
  maker: boolean;
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  purchasedAt?: Date | null;
  type?: string | null;
  targetPrice?: number | null;
  makerId?: string | null;
  score?: number | null;
  createdAt: Date;
}

export interface Offer {
  id: string;
  userId: string;
  postId: string;
  makerId: string;
  message: string;
  price?: number | null;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  message: string;
  imageUrl?: string | null;
  createdAt: Date;
}
