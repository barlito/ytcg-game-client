import { useDrag } from "react-dnd";

type Card = {
    id: string;
    name: string;
};

type CardProps = {
    card: Card;
};

export const Card = ({ card }: CardProps) => {
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
                cursor: "grab",
            }}
        >
            {card.name}
        </div>
    );
};
