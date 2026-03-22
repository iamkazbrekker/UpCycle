"use client"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Flag, Mic, Paperclip, PhoneCall, Send, X } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"

interface ChatMessage {
    sender: string;
    text: string;
    timestamp: string;
    type: "message" | "system";
}

interface WSMessage {
    type: "message" | "system" | "history" | "error" | "room_update";
    sender?: string;
    text?: string;
    timestamp?: string;
    roomId?: string;
    messages?: Array<{ sender: string; text: string; timestamp: string; }>;
    connected?: string[];
}

function Page() {

    const { isLoaded: userLoaded, isSignedIn, user: clerkUser } = useUser()
    const currentUsername = clerkUser?.fullName || clerkUser?.username || "Anonymous"

    const params = useParams()

    const encodedRoomId = params.roomId as string
    const roomId = decodeURIComponent(encodedRoomId)

    const [otherUser, productId] = roomId.split("+")
    const targetName = params.username as string // The person we are talking to

    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [connected, setConnected] = useState<string[]>([])
    const [wsStatus, setWsStatus] = useState<
        "connecting" | "connected" | "disconnected" | "error"
    >("connecting")

    const wsRef = useRef<WebSocket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const connectWebSocket = useCallback(() => {
        const ws = new WebSocket("ws://localhost:3001")
        wsRef.current = ws

        ws.onopen = () => {
            console.log("[WS] Connected")
            setWsStatus("connected")

            ws.send(
                JSON.stringify({
                    type: "join",
                    roomId,
                    username: currentUsername
                })
            )
        }

        ws.onmessage = (event) => {
            try {
                const data: WSMessage = JSON.parse(event.data)

                switch (data.type) {
                    case "history":
                        if (data.messages) {
                            setMessages(
                                data.messages.map((m) => ({
                                    sender: m.sender,
                                    text: m.text,
                                    timestamp: m.timestamp,
                                    type: "message" as const
                                }))
                            )
                        }
                        break

                    case "message":
                        setMessages((prev) => [
                            ...prev,
                            {
                                sender: data.sender || "Unknown",
                                text: data.text || "",
                                timestamp: data.timestamp || new Date().toISOString(),
                                type: "message",
                            }
                        ])
                        break

                    case "system":
                        setMessages((prev) => [
                            ...prev,
                            {
                                sender: "SYSTEM",
                                text: data.text || "",
                                timestamp: data.timestamp || new Date().toISOString(),
                                type: "system"
                            }
                        ])
                        break

                    case "room_update":
                        if (data.connected) {
                            setConnected(data.connected)
                        }
                        break

                    case "error":
                        console.error("[WS] Error: ", data.text)
                        setMessages((prev) => [
                            ...prev,
                            {
                                sender: "ERROR",
                                text: data.text || "Unknown Error",
                                timestamp: new Date().toISOString(),
                                type: "system"
                            }
                        ])
                        break
                }
            } catch (err) {
                console.log("[WS] Failed to parse message: ", err)
            }
        }

        ws.onclose = () => {
            console.log("[WS] Disconnected")
            setWsStatus("disconnected")

            reconnectTimeoutRef.current = setTimeout(() => {
                console.log("[WS] Attempting reconnection...");
                setWsStatus("connecting");
                connectWebSocket();
            }, 3000);
        }

        ws.onerror = (err) => {
            console.error("[WS] Error: ", err)
            setWsStatus("error")
        }
    }, [roomId, currentUsername])

    useEffect(() => {
        if (userLoaded && isSignedIn && currentUsername !== "Anonymous") {
            connectWebSocket();
        }

        return () => {
            // Cleanup on unmount
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connectWebSocket, userLoaded, isSignedIn, currentUsername]);

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        wsRef.current.send(
            JSON.stringify({
                type: "message",
                roomId,
                username: currentUsername,
                text: input.trim()
            })
        )

        setInput("")
        inputRef.current?.focus()
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 flex flex-row justify-between items-center p-4 border-b border-zinc-100 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#3a77ff] to-[#0052ff] flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {targetName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-zinc-800 leading-tight">{targetName}</h1>
                        <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                            online
                        </p>
                    </div>
                </div>
                <div className="flex flex-row gap-3 text-zinc-400">
                    <button className="hover:text-[#3a77ff] transition-colors p-2 rounded-full hover:bg-blue-50">
                        <PhoneCall size={20} />
                    </button>
                    <button className="hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <Flag size={20} />
                    </button>
                    <Link href={`/product/${productId}`} className="hover:text-zinc-800 transition-colors p-2 rounded-full hover:bg-zinc-100">
                        <X size={20} />
                    </Link>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-6 bg-[#edeff2] space-y-4">
                {messages.map((msg, index) => {
                    const isSender = msg.sender === currentUsername;
                    return (
                        <div key={index} className={`flex w-full ${msg.type === "system" ? "justify-center" : isSender ? "justify-end" : "justify-start"}`}>
                            {msg.type === "system" ? (
                                <div className="bg-zinc-400/20 backdrop-blur-sm text-zinc-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                    {msg.text}
                                </div>
                            ) : (
                                <div className={`relative max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all hover:shadow-md ${isSender
                                        ? "bg-[#3a77ff] text-white rounded-tr-none ml-12"
                                        : "bg-white text-zinc-800 rounded-tl-none border border-zinc-200/50 mr-12"
                                    }`}>
                                    {!isSender && (
                                        <div className="text-[11px] font-bold text-blue-600 mb-0.5 opacity-90 uppercase tracking-tight">
                                            {msg.sender}
                                        </div>
                                    )}
                                    <div className="text-[14px] leading-relaxed wrap-break-word pr-12">
                                        {msg.text}
                                    </div>
                                    <div className={`absolute bottom-1 right-2 text-[9px] font-medium opacity-70 ${isSender ? "text-blue-100" : "text-zinc-500"
                                        }`}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
                <div className="max-w-5xl mx-auto">
                    <InputGroup className="h-12! border-none bg-zinc-100 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-[#3a77ff]/20 transition-all">
                        <InputGroupAddon align="inline-start">
                            <Paperclip className="text-zinc-400 hover:text-[#3a77ff] cursor-pointer transition-colors ml-1" size={22} />
                        </InputGroupAddon>

                        <InputGroupInput
                            ref={inputRef}
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            type="text"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                            disabled={wsStatus !== "connected"}
                            className="text-zinc-800 h-full border-none focus-visible:ring-0 px-1 placeholder:text-zinc-400"
                        />

                        <InputGroupAddon align="inline-end">
                            {input.trim() ? (
                                <button
                                    onClick={sendMessage}
                                    className="bg-[#3a77ff] text-white p-2 rounded-xl shadow-md hover:bg-blue-600 cursor-pointer transition-all active:scale-95 flex items-center justify-center mr-1"
                                >
                                    <Send size={18} />
                                </button>
                            ) : (
                                <Mic className="text-zinc-400 hover:text-[#3a77ff] cursor-pointer transition-colors mr-1" size={22} />
                            )}
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
        </div>
    )
}

export default Page
