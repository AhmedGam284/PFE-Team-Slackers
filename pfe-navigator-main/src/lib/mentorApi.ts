import { apiPostJson } from "./apiClient";
import type { MentorChatData, MentorChatRequest, MentorChatResponse } from "./apiContracts";

export const mentorChat = async (payload: MentorChatRequest): Promise<MentorChatData> => {
  const res = await apiPostJson<MentorChatResponse, MentorChatRequest>(
    "/api/mentor/chat",
    payload,
  );
  return res.data;
};
