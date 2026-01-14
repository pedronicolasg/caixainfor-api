export interface AuthenticatedUser {
  id: string;
  email?: string;
  [key: string]: any;
}
