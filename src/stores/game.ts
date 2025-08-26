import { create } from "zustand";
import type { CardData } from "../components/hand/CardView";

type GameState = {
    hand: CardData[];
    board: Record<string, CardData | undefined>; // clé = "q,r"
    playCard: (hexKey: string, card: CardData) => void;
};

export const useGameStore = create<GameState>((set) => ({
    hand: [],
    board: {},
    playCard: (hexKey, card) =>
        set((state) => ({
            hand: state.hand.filter((c) => c.id !== card.id),
            board: { ...state.board, [hexKey]: card },
        })),
}));
