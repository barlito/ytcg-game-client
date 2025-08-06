import { useEffect, useRef, useState, useCallback } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import Tilt from "react-parallax-tilt";
import type {Card as CardType} from "./stores/game";

function useSmoothTilt(transform, isDragging) {
    const lastPosRef = useRef({ x: 0, y: 0 });
    const [tilt, setTilt] = useState({ tiltX: 0, tiltY: 0 });
    const rafRef = useRef();

    // "Intensité" du vent
    const speedToTilt = 0.5;
    const maxTilt = 10;
    const friction = 0.94;
    const lerpAmt = 0.10;

    // Animation de retour à zéro avec friction
    const animate = useCallback(() => {
        setTilt(prev => {
            let { tiltX, tiltY } = prev;
            // Seuil plus large pour éviter les resets secs
            if (Math.abs(tiltX) < 0.3 && Math.abs(tiltY) < 0.3) {
                return { tiltX: 0, tiltY: 0 };
            }
            return {
                tiltX: tiltX * friction,
                tiltY: tiltY * friction,
            };
        });
        rafRef.current = requestAnimationFrame(animate);
    }, [friction]);

    // Gestion du dragging et calcul du tilt basé sur la vitesse
    useEffect(() => {
        if (isDragging && transform) {
            const dx = transform.x - lastPosRef.current.x;
            const dy = transform.y - lastPosRef.current.y;
            lastPosRef.current = { x: transform.x, y: transform.y };

            setTilt(prev => {
                // Nouveau "cible" tilt basé sur la vitesse du curseur
                let targetTiltY = prev.tiltY - dx * speedToTilt;
                let targetTiltX = prev.tiltX + dy * speedToTilt;

                // Lissage avec interpolation linéaire (lerp)
                targetTiltY = prev.tiltY + (targetTiltY - prev.tiltY) * lerpAmt;
                targetTiltX = prev.tiltX + (targetTiltX - prev.tiltX) * lerpAmt;

                // Clamp
                targetTiltY = Math.max(Math.min(targetTiltY, maxTilt), -maxTilt);
                targetTiltX = Math.max(Math.min(targetTiltX, maxTilt), -maxTilt);

                return { tiltX: targetTiltX, tiltY: targetTiltY };
            });
        }
    }, [transform?.x, transform?.y, isDragging, speedToTilt, lerpAmt, maxTilt]);

    // Gestion de l'arrêt du dragging
    useEffect(() => {
        if (isDragging) {
            // Démarrer l'animation de friction
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(animate);
        } else {
            // Arrêter l'animation et reset
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            setTilt({ tiltX: 0, tiltY: 0 });
            lastPosRef.current = { x: 0, y: 0 };
        }

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [isDragging, animate]);

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
