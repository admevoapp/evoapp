
export interface UserSettings {
  notifications: {
    likes: boolean;
    comments: boolean;
    followers: boolean;
  };
  appearance: {
    theme: 'light' | 'dark';
  };
}

export interface User {
  id: number | string;
  name: string;
  username: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  profession?: string;
  birthDate?: string;
  maritalStatus?: string; // Novo campo
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  connections?: (number | string)[];
  favorites?: (number | string)[];
  settings?: UserSettings;

  // Role and Status
  role?: 'user' | 'premium' | 'moderator' | 'admin' | 'master' | 'partner';
  app_role?: 'user' | 'premium' | 'moderator' | 'admin' | 'master' | 'partner';
  status?: 'active' | 'suspended' | 'blocked';

  // New fields for settings page
  mission?: string;
  evoStatus?: {
    pelopes: boolean;
    academy: boolean;
    family: boolean;
    leader: boolean;
    teamEngineering: boolean;
    missions: boolean;
    missionsLeader: boolean;
    legacy: boolean;
    eagles: boolean;
    trainer: boolean;
    headTrainer: boolean;
    partners: boolean;
    dominios?: boolean;
  };
  classYear?: string;
  helpArea?: string;
  behavioralProfile?: string;
  location?: {
    fullAddress?: string;
    neighborhood?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  socials?: {
    instagram?: string;
    whatsapp?: string;
    linkedin?: string;
  };
  gallery?: string[]; // up to 3
  token_version?: number;
  status_reason?: string;
}

export interface Post {
  id: number;
  user_id?: string; // Foreign key from Supabase
  author: User; // Joined data
  content: string;
  imageUrl?: string;
  image_url?: string; // From Supabase
  likes: number; // count
  comments: number; // count
  created_at?: string;
  timestamp: string; // Formatting helper
  isLiked: boolean;
  isPinned?: boolean;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  text: string;
  created_at: string;
  user?: User; // Joined data
}

export interface Notification {
  id: string; // uuid
  user_id: string; // uuid
  actor?: {
    id: string;
    name: string;
    avatar_url: string;
    username: string;
  };
  action: string;
  target?: string;
  target_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: number | string;
  senderId: number | string;
  receiverId: number | string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  display_date: string;
  display_time: string;
  sort_date?: string;
  location: string;
  image_url: string;
  category: string;
  link?: string;
  archived?: boolean;
}

export interface Banner {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  active: boolean;
}

export interface LibraryItem {
  id: number;
  title: string;
  type: 'pdf' | 'image' | 'video' | 'link';
  url: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  stock?: number;
  active?: boolean;
  badge?: string;
  shipping_info?: string;
  warranty_info?: string;
  features?: string[];
  is_new?: boolean;
  created_at?: string;
}

export interface PremiumContent {
  id: string; // uuid
  title: string;
  author: string;
  role?: string;
  type: string; // Masterclass, Curso, etc.
  duration: string;
  thumbnail: string;
  category: string;
  description?: string;
  level?: string;
  video_url?: string;
  is_new?: boolean;
  active?: boolean;
  instructor_avatar?: string;
  has_certificate?: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SystemSettings {
  // General
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;

  // Visual
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;

  // Landing & Footer
  landingTitle: string;
  landingSubtitle: string;
  footerPhrase: string;

  // Contact
  supportEmail: string;
  whatsapp: string;

  // Socials
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };

  // Legal URLs
  termsUrl?: string;
  privacyUrl?: string;
}

export interface Testimonial {
  id: number;
  senderId: number | string;
  receiverId: number | string;
  message: string;
  date: string;
  privacy: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected';
}

export type Page =
  | 'feed'
  | 'profile'
  | 'connections'
  | 'favorites'
  | 'messages'
  | 'settings'
  | 'search'
  | 'events'
  | 'event-details'
  | 'about'
  | 'mission'
  | 'how-it-works'
  | 'admins'
  | 'terms'
  | 'privacy'
  | 'guidelines'
  | 'cookies'
  | 'library'
  | 'best-practices'
  | 'help-center'
  | 'contact'
  | 'report'
  | 'testimonials'
  | 'courses'
  | 'lives'
  | 'premium'
  | 'shop'
  | 'admin-hub'
  | 'central-evo'
  | 'notifications';
