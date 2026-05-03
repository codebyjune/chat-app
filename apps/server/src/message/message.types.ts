export type MessageResponse = {
  id: number;
  content: string;
  sentAt: Date;
  readAt: Date | null;
  senderId: number;
  receiverId: number;
};
