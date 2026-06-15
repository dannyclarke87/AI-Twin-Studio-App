export type AuthState = 'logged-out' | 'unpaid' | 'paid' | 'admin';
export type Category = 'All' | 'Video' | 'Images' | 'LinkedIn' | 'Memes';

export interface User {
  id: string;
  email: string;
  status: 'unpaid' | 'paid' | 'admin';
  createdAt: string;
}

export interface AppItem {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'All'>;
  image?: string;
  link?: string;
}
