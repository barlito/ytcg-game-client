import { useDrag } from "react-dnd";

type Props = {
    card: { id: string; name: string };
};

export const Card = ({ card }: Props) => {
    const [{ isDragging }, dragRef] = useDrag({
        type: "CARD",
        item: { id: card.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={dragRef}
            style={{
                opacity: isDragging ? 0.5 : 1,
                border: "1px solid black",
                padding: "0.5rem",
                margin: "0.5rem",
                background: "white",
                cursor: "move",
            }}
        >
            {card.name}
        </div>
    );
};

export const Hand = () => {
    const cards = [
        { id: "fireball", name: "Fireball" },
        { id: "defend", name: "Defend" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {cards.map((card) => (
                <Card key={card.id} card={card} />
            ))}
        </div>
    );
};
