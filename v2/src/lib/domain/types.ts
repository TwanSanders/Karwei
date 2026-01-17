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
  status: 'open' | 'in_progress' | 'fixed' | 'closed';
  lat?: number | null;
  long?: number | null;
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

export interface Notification {
  id: string;
  userId: string;
  type: 'offer' | 'accept' | 'contact_request';
  relatedId: string;
  read: boolean;
  createdAt: Date;
}
