import { create } from "zustand";

export type Card = {
    id: string;
    name: string;
};

type GameState = {
    hand: Card[];
    board: Record<string, Card | undefined>; // clé = "q,r"
    playCard: (hexKey: string, card: Card) => void;
};

export const useGameStore = create<GameState>((set) => ({
    hand: [
        { id: "fireball", name: "Fireball" },
        { id: "defend", name: "Defend" },
    ],
    board: {},
    playCard: (hexKey, card) =>
        set((state) => ({
            hand: state.hand.filter((c) => c.id !== card.id),
            board: { ...state.board, [hexKey]: card },
        })),
}));
