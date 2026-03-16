import { connect } from "@/dbConfig/dbConfig";
import { currentUser } from "@clerk/nextjs/server";
import Elysia from "elysia";
import Room from "@/models/RoomModel"



const room = new Elysia({ prefix: "/room" })
    .post("/", async ({ body, set }: any) => {
        try {
            await connect()
            console.log("[API] /api/room POST request body: ", body)
            const user = await currentUser()
            const seller = body?.seller
            const buyer = body?.buyer || user?.username || 'anonymous'
            const roomId = body?.roomId

            const existingRoom = await Room.findOne({ roomId })
            if (existingRoom) {
                console.log(`[API] Room already exists: `, existingRoom.roomId)
                return {
                    seller: (existingRoom as any).seller,
                    buyer: (existingRoom as any).buyer,
                    roomId: (existingRoom as any).roomId
                }
            }

            console.log(`[API] connecting to DB and saving room for buyer: ${buyer} and seller: ${seller}`)
            const newRoom = new Room({
                buyer,
                seller,
                roomId,
                connected: [seller, buyer]
            })

            const savedRoom = await newRoom.save()
            console.log(`[API] Room created successfully: `, savedRoom.roomId)

            return {
                seller: (savedRoom as any).seller,
                buyer: (savedRoom as any).buyer,
                roomId: (savedRoom as any).roomId
            }
        } catch (error: any) {
            console.error("[API] Error creating room:", error);
            set.status = 500;
            return { error: error.message || "Failed to create room" };
        }
    })

const app = new Elysia({ prefix: '/api' })
    .use(room)

export const GET = app.fetch
export const POST = app.fetch

export type App = typeof app