import { HexMap } from "./HexMap";
import { Hand } from "./Hand";
import { DndContext } from "@dnd-kit/core";
import { useGameStore } from "./stores/game";
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';


export default function App() {
    const playCard = useGameStore((state) => state.playCard);

    return (
        <div className="ytcg-root">
            <header>
                <h1>YTCG - Map PoC</h1>
            </header>
            <main className="ytcg-main">
                <DndContext
                    modifiers={[restrictToFirstScrollableAncestor]}
                    onDragEnd={({ over, active }) => {
                        if (over && active) {
                            const card = active.data.current;
                            const hexKey = over.id;
                            if (card && hexKey) {
                                playCard(hexKey, card);
                            }
                        }
                    }}
                >
                    <section className="ytcg-map-container">
                        <HexMap />
                    </section>
                    <nav className="ytcg-hand-bar">
                        <Hand />
                    </nav>
                </DndContext>
            </main>
        </div>
    );
}
