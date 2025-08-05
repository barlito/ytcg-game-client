import { Hexagon } from "react-hexgrid";
import { useDrop } from "react-dnd";

type HexTileProps = {
    q: number;
    r: number;
    s: number;
    onDrop: (hexKey: string) => void;
};

export const HexTile = ({ q, r, s, onDrop }: HexTileProps) => {
    const [{ isOver }, dropRef] = useDrop({
        accept: "CARD",
        drop: () => onDrop(`${q},${r}`),
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
            />
        </g>
    );
};
