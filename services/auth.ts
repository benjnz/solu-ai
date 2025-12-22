export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'client' | 'associate' | 'admin';
}

// Simulate Google OAuth flow
export const loginWithGoogle = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        name: "Alex Associate",
        email: "alex@solu.ai",
        avatar: "https://ui-avatars.com/api/?name=Alex+Associate&background=f59e0b&color=fff",
        role: "associate"
      });
    }, 1500); // Simulate network delay
  });
};

export const logout = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
};