import {Card} from "./Card.tsx";

export const Hand = () => {
    const cards = [
        { id: "fireball", name: "Fireball" },
        { id: "defend", name: "Defend" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "row", color: "black" }}>
            {cards.map((card) => (
                <Card key={card.id} card={card} />
            ))}
        </div>
    );
};
