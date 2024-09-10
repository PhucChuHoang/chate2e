export interface User {
  id: string;
  name: string;
}

export interface Message {
  message: string;
  from_user: string;
  to_user: string;
}