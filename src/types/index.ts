export interface User {
  _id: string;
  email: string;
  fullName: string;
  tokenDate?: string;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
}

export interface Car {
  _id?: string;
  user?: User;
  brand: string;
  model: string;
  price: number;
  mainPhoto: string;
  additionalPhotos: string[];
  createdAt?: string;
  updatedAt?: string;
  id?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  fullName: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface ListingFormData {
  brand: string;
  model: string;
  price: string;
  mainPhoto: string;
  additionalPhotos: string[];
}
