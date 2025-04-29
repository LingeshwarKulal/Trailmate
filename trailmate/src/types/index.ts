export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface GearItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  brand: string;
  rating: number;
  reviews: Review[];
  imageUrl: string;
  activity?: string;
  season?: string;
  experienceLevel?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface GearChecklist {
  id: string;
  userId: string;
  name: string;
  items: GearItem[];
  activity: string;
  location: string;
  season: string;
  experienceLevel: string;
  budget: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAnswers {
  activity: string;
  location: string;
  season: string;
  experienceLevel: string;
  budget: number;
} 