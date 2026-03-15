"use client"


import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Flag, Mic, Paperclip, PhoneCall, Send, X } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

function Page() {

    const params = useParams()

    const encodedRoomId = params.roomId as string
    const roomId = decodeURIComponent(encodedRoomId)

    const [user, productId] = roomId.split("+")
    const username = params.username as string

    const [input, setInput] = useState("")

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <header className="text-[#3a77ff] flex flex-row justify-between p-4 border-b pb-0">
                <div>
                    <h1 className="text-2xl  font-bold">{username}</h1>
                </div>
                <div className="flex flex-row gap-8">
                    <Flag />
                    <PhoneCall />
                    <Link href={`/product/${productId}`}>
                        <X />
                    </Link>
                </div>
            </header>
            <div className="flex-1">

            </div>
            <div className="p-4">
                <div>
                    <InputGroup className="border border-[#3a77ff] rounded-3xl">
                    {input.length === 0 && (
                        <InputGroupAddon align={"inline-start"}><Paperclip className="text-[#3a77ff]" /></InputGroupAddon>
                    )}
                        <InputGroupInput placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            type="text"
                            autoFocus
                            className="text-[#3a77ff] w-full  focus:border-{#035efd] focus:outline-none transition-colors py-3 pl-8 pr-4" />
                        {input.length === 0 && (<InputGroupAddon align="inline-end"><Mic className="text-[#3a77ff]"/></InputGroupAddon>)}
                        <InputGroupAddon align="inline-end"><Send className="text-[#3a77ff]" /></InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
        </div>
    )
}

export default Page
