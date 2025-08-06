import React from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import Tilt from "react-parallax-tilt";

function getTiltFromTransform(transform) {
    if (!transform) return { tiltX: 0, tiltY: 0 };
    const maxTilt = 20;
    const tiltY = Math.max(Math.min(transform.x / 6, maxTilt), -maxTilt);
    const tiltX = Math.max(Math.min(-transform.y / 6, maxTilt), -maxTilt);
    return { tiltX, tiltY };
}

function Card({ id, name }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const { tiltX, tiltY } = isDragging ? getTiltFromTransform(transform) : { tiltX: 0, tiltY: 0 };

    return (
        <Tilt
            tiltMaxAngleX={20}
            tiltMaxAngleY={20}
            tiltAngleXManual={isDragging ? tiltX : undefined}
            tiltAngleYManual={isDragging ? tiltY : undefined}
            glareEnable={false}
            style={{ width: 160, height: 220 }}
            transitionSpeed={200}
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
                    opacity: isDragging ? 0.7 : 1,
                    transform: transform
                        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                        : undefined,
                    transition: isDragging ? "none" : "box-shadow 0.2s",
                    willChange: "transform",
                }}
            >
                {name}
            </div>
        </Tilt>
    );
}

export default function CardDragDemo() {
    return (
        <DndContext>
            <div style={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#2b2c38",
                flexDirection: "column",
            }}>
                <Card id="card-1" name="Ma carte 🚀" />
            </div>
        </DndContext>
    );
}
