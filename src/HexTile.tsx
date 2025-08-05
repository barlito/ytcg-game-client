import { HexGrid, Layout, Hexagon, Text, Pattern, Path, Hex } from 'react-hexgrid';
import { useDrop } from "react-dnd";
import {useGameStore} from "./stores/game.ts";

type HexTileProps = {
    q: number;
    r: number;
    s: number;
    onDrop: (hexKey: string) => void;
};

export const HexTile = ({ q, r, s }: HexTileProps) => {
    const playCard = useGameStore((state) => state.playCard);
    const board = useGameStore((state) => state.board);
    const hexKey = `${q},${r}`;
    const card = board[hexKey];

    const [{ isOver }, dropRef] = useDrop({
        accept: "CARD",
        drop: (item: { id: string; name: string }) => {
            playCard(hexKey, item);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <g ref={dropRef}>
            <Hexagon
                q={q}
                r={r}
                s={s}
                style={{ fill: isOver ? "lightgreen" : "lightgray", stroke: "#444" }}
            >
                <Text style={{ fill: "black", stroke: "none"}}>
                    {card ? card.name : [q, r].join(", ")}
                </Text>
            </Hexagon>
        </g>
    );
};
