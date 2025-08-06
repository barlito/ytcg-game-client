import {HexGrid, Layout} from "react-hexgrid";
import {HexTile} from "./HexTile.tsx";

function generateHexes(radius = 3) {
    const hexes = [];
    for (let q = -radius; q <= radius; q++) {
        for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
            hexes.push({q, r});
        }
    }
    return hexes;
}

export const HexMap = () => {
    const hexes = generateHexes(2); // change "3" for even bigger map

    return (
        <HexGrid
            width={"100vw"}
            height={540}
            style={{
                maxWidth: "95vw",
                maxHeight: "calc(100vh - 320px)",
            }}>
            <Layout size={{x: 10, y: 10}} flat={true} spacing={1.1} origin={{x: 0, y: 0}}>
                {hexes.map((hex) => (
                    <HexTile
                        key={`${hex.q},${hex.r}`}
                        q={hex.q}
                        r={hex.r}
                    />
                ))}
            </Layout>
        </HexGrid>
    );
};
