import React from "react"
import type { HexKey } from "../../game/types"

type Props = {
    targetHex: HexKey | null
    isValid: boolean
    reason?: string
}

export default function DropPreview({ targetHex, isValid, reason }: Props) {
    if (!targetHex) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className={`px-6 py-3 rounded-lg shadow-2xl border-2 backdrop-blur-sm transition-all duration-200 transform ${
                isValid
                    ? "bg-green-500/90 border-green-400 text-white"
                    : "bg-red-500/90 border-red-400 text-white"
            }`}>
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isValid ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                    </svg>
                    <div className="text-sm font-bold">
                        {isValid ? (
                            <span>Drop at <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{targetHex}</span></span>
                        ) : (
                            <span>{reason || "Cannot drop here"}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
