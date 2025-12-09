// Generic API Response Wrapper
export interface ApiResponse<T> {
  error: number;
  message: string;
  data: T | null;
}

// Auth
export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginData {
  token: string;
}

// Hairstyles
export type HairstyleGender = "Male" | "Female";
export type HairstyleCategory = "long" | "short" | "curly" | "straight" | "color" | "all";

export interface AdminHairstyle {
  id: string;
  name: string;
  imageUrl: string;
  gender: HairstyleGender;
  category: HairstyleCategory;
  tags: string[];
  description: string;
  heat: number;
  createdAt?: string;
}

export interface PaginationRes<T> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminGetHairstylesRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  gender?: HairstyleGender;
  category?: HairstyleCategory;
}

export interface AdminCreateHairstyleRequest {
  name: string;
  gender: HairstyleGender;
  category: Exclude<HairstyleCategory, "all">;
  tags: string[];
  description?: string;
  heat?: number;
  imagePath: string;
}

export interface AdminUpdateHairstyleRequest {
  id: string;
  name?: string;
  gender?: HairstyleGender;
  category?: Exclude<HairstyleCategory, "all">;
  tags?: string[];
  description?: string;
  heat?: number;
  imagePath?: string;
}

// Upload
export interface UploadImageResponse {
  imagePath: string;
  imageUrl: string;
}
