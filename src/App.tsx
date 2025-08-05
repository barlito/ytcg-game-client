import './App.css'
import { HexMap } from "./HexMap";
import { Hand } from "./Hand";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
    return (
        <div>
            <h1>YTCG - Map PoC</h1>
            <DndProvider backend={HTML5Backend}>
                <Hand />
                <HexMap />
            </DndProvider>
        </div>
    );
}

export default App
