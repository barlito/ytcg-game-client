import { HexGrid, Layout } from "react-hexgrid";
import {HexTile} from "./HexTile.tsx";

type Props = {
    onDrop: (hexKey: string) => void;
};

export const HexMap = ({ onDrop }: Props) => {
    const hexes = [
        { q: 0, r: 0},
        { q: 1, r: 0},
        { q: 0, r: 1},
        { q: -1, r: 1},
    ];

    return (
        <HexGrid width={800} height={600}>
            <Layout size={{ x: 10, y: 10 }} flat={false} spacing={1.1} origin={{ x: 0, y: 0 }}>
                {hexes.map((hex) => (
                    <HexTile
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
