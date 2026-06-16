export type AuthState = 'logged-out' | 'unpaid' | 'paid' | 'admin' | 'legacy';
export type Category = 'All' | 'Video' | 'Images' | 'LinkedIn' | 'Memes' | 'Voice' | 'Text';

export interface User {
  id: string;
  email: string;
  status: 'unpaid' | 'paid' | 'admin' | 'legacy';
  createdAt: string;
}

export interface AppItem {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'All'> | Exclude<Category, 'All'>[];
  image?: string;
  link?: string;
}
