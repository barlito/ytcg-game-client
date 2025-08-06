import {useGameStore} from "./stores/game.ts";
import { Card } from "./Card";

export const Hand = () => {
    const hand = useGameStore((state) => state.hand);

    return (
        <div style={{ display: "flex", flexDirection: "row", color: "black" }}>
            {hand.map((card) => (
                <Card key={card.id} card={card} />
            ))}
        </div>
    );
};
