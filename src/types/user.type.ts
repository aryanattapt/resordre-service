export interface UserResponse {
   user_id: string;
   user_name: string;
   fullname: string;
   email: string;
   role: string;
   is_active: boolean;
   created_at: Date;
}

export interface UserUpdateRequest {
   user_name?: string;
   fullname?: string;
   email?: string;
   role?: string;
   is_active?: boolean;
   password?: string;
}
