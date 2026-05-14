export interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}