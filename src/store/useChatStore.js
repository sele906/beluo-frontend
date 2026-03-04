import { create } from "zustand";

const useChatStore = create((set) => ({
  characterCache: {}, 
  setCharacterInfo: (sessionId, info) =>
    set((state) => ({
      characterCache: { ...state.characterCache, [sessionId]: info }
    }))
}));

export default useChatStore;