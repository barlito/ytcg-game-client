import { useEffect, useRef, useState, useCallback } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import Tilt from "react-parallax-tilt";
import type {Card as CardType} from "./stores/game";

function useSmoothTilt(transform, isDragging) {
    const lastPosRef = useRef({ x: 0, y: 0 });
    const [tilt, setTilt] = useState({ tiltX: 0, tiltY: 0 });
    const rafRef = useRef(null);
    const isAnimatingRef = useRef(false);

    // Constants
    const speedToTilt = 0.5;
    const maxTilt = 10;
    const friction = 0.94;
    const lerpAmt = 0.10;

    // Animation de friction quand on ne bouge plus
    useEffect(() => {
        if (!isDragging) {
            // Reset immédiat quand on arrête de drag
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            isAnimatingRef.current = false;
            setTilt({ tiltX: 0, tiltY: 0 });
            lastPosRef.current = { x: 0, y: 0 };
            return;
        }

        // Animation de friction pendant le drag
        const animate = () => {
            setTilt(prev => {
                const { tiltX, tiltY } = prev;
                if (Math.abs(tiltX) < 0.3 && Math.abs(tiltY) < 0.3) {
                    isAnimatingRef.current = false;
                    return { tiltX: 0, tiltY: 0 };
                }
                if (isAnimatingRef.current) {
                    rafRef.current = requestAnimationFrame(animate);
                }
                return {
                    tiltX: tiltX * friction,
                    tiltY: tiltY * friction,
                };
            });
        };

        if (!isAnimatingRef.current) {
            isAnimatingRef.current = true;
            rafRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            isAnimatingRef.current = false;
        };
    }, [isDragging]);

    // Calcul du tilt basé sur le mouvement - sans useEffect !
    if (isDragging && transform) {
        const currentX = transform.x || 0;
        const currentY = transform.y || 0;

        const dx = currentX - lastPosRef.current.x;
        const dy = currentY - lastPosRef.current.y;

        // Seulement si il y a eu un mouvement significatif
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            lastPosRef.current = { x: currentX, y: currentY };

            // Mise à jour immédiate du tilt
            setTilt(prev => {
                let targetTiltY = prev.tiltY - dx * speedToTilt;
                let targetTiltX = prev.tiltX + dy * speedToTilt;

                targetTiltY = prev.tiltY + (targetTiltY - prev.tiltY) * lerpAmt;
                targetTiltX = prev.tiltX + (targetTiltX - prev.tiltX) * lerpAmt;

                targetTiltY = Math.max(Math.min(targetTiltY, maxTilt), -maxTilt);
                targetTiltX = Math.max(Math.min(targetTiltX, maxTilt), -maxTilt);

                return { tiltX: targetTiltX, tiltY: targetTiltY };
            });
        }
    }

    return tilt;
}


type CardProps = {
    card: CardType;
};

export function Card({ card }: CardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: card.id,
        data: card,
    });
    const { tiltX, tiltY } =
        // { tiltX: 0, tiltY: 0 }
        useSmoothTilt(transform, isDragging);

    return (
        <Tilt
            tiltMaxAngleX={16}
            tiltMaxAngleY={16}
            tiltAngleXManual={isDragging ? tiltX : undefined}
            tiltAngleYManual={isDragging ? tiltY : undefined}
            glareEnable={false}
            style={{ width: 160, height: 220 }}
            transitionSpeed={350}
            scale={isDragging ? 1.04 : 1}
        >
            <div
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #ffe29f 0%, #ffa99f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 28,
                    userSelect: "none",
                    cursor: "grab",
                    border: "2px solid #ffce4b",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    // opacity: isDragging ? 0.7 : 1,
                    transform: transform
                        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                        : undefined,
                    // transition: isDragging ? "none" : "box-shadow 0.2s",
                    willChange: "transform",
                }}
            >
                {card.name}
            </div>
        </Tilt>
    );
}

// export default function CardDragDemo() {
//     return (
//         <DndContext>
//             <div style={{
//                 minHeight: "70vh",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 background: "#2b2c38",
//                 flexDirection: "column",
//             }}>
//                 <Card id="card-1" name="Ma carte 🚀" />
//             </div>
//         </DndContext>
//     );
// }
