export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "MASTER" | "PLAYER";
  createdAt: Date;
  updatedAt: Date;
}
