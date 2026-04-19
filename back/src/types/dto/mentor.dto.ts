export type MentorChatRequest = {
  message: string;
  studentName?: string;
  specialization?: string;
  readinessScore?: number;
  topTrack?: string;
  skillGaps?: string[];
};

export type MentorChatData = {
  reply: string;
  quickReplies: string[];
};
