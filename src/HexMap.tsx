// import React from "react";
import { HexGrid, Layout, Hexagon } from "react-hexgrid";
import { useDrop } from "react-dnd";

type Props = {
    onDrop: (hexKey: string) => void;
};

export const HexMap = ({ onDrop }: Props) => {
    const hexes = [
        { q: 0, r: 0, s: 0 },
        { q: 1, r: 0, s: -1 },
        { q: 0, r: 1, s: -1 },
        { q: -1, r: 1, s: 0 },
    ];

    return (
        <HexGrid width={800} height={600}>
            <Layout size={{ x: 10, y: 10 }} flat={false} spacing={1.1} origin={{ x: 0, y: 0 }}>
                {hexes.map((hex) => (
                    <DroppableHex
                        key={`${hex.q},${hex.r}`}
                        q={hex.q}
                        r={hex.r}
                        s={hex.s}
                        onDrop={onDrop}
                    />
                ))}
            </Layout>
        </HexGrid>
    );
};

type HexProps = {
    q: number;
    r: number;
    s: number;
    onDrop: (hexKey: string) => void;
};

const DroppableHex = ({ q, r, s, onDrop }: HexProps) => {
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
