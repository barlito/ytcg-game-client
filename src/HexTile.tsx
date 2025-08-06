import { HexGrid, Layout, Hexagon, Text, Pattern, Path, Hex } from 'react-hexgrid';
import { useDrop } from "react-dnd";
import {useGameStore} from "./stores/game.ts";
import { useDroppable } from "@dnd-kit/core";

type HexTileProps = {
    q: number;
    r: number;
    s: number;
    onDrop: (hexKey: string) => void;
};

export const HexTile = ({ q, r, s }: HexTileProps) => {
    const board = useGameStore((state) => state.board);
    const hexKey = `${q},${r}`;
    const card = board[hexKey];

    const { isOver, setNodeRef } = useDroppable({
        id: hexKey,
        data: { hexKey },
    });

    return (
        <g ref={setNodeRef}>
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
