import { useDrag } from "react-dnd";
import type {Card as CardType} from "@/stores/game";

type CardProps = {
    card: CardType;
};

export const Card = ({ card }: CardProps) => {
    const [{ isDragging }, dragRef] = useDrag({
        type: "CARD",
        item: { ...card },
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
