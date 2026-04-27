import { connect } from "@/dbConfig/dbConfig";
import { currentUser } from "@clerk/nextjs/server";
import Elysia from "elysia";
import Room from "@/models/RoomModel"
import Product from "@/models/ProductModel"
import seedData from "@/data/values.json"

// ─── Room routes ───────────────────────────────────────────────────
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

// ─── Product routes ─────────────────────────────────────────────────
const products = new Elysia({ prefix: "/products" })
    // GET /api/products  – returns all products, seeds DB from values.json on first run
    .get("/", async ({ set }: any) => {
        try {
            await connect()

            // Seed static products from values.json if they don't exist yet
            for (const item of (seedData as any).products) {
                const exists = await Product.findOne({ sellerId: `seed-${item.productId}` })
                if (!exists) {
                    await Product.create({
                        name: item.name,
                        price: Number(item.price),
                        imageUrl: item.src,
                        listedBy: item.soldBy,
                        sellerId: `seed-${item.productId}`,
                        date: new Date(item.date),
                        category: "Books",
                        condition: "Good",
                        description: ""
                    })
                }
            }

            const all = await Product.find({}).sort({ createdAt: -1 }).lean()
            return { products: all }
        } catch (error: any) {
            console.error("[API] Error fetching products:", error)
            set.status = 500
            return { error: error.message || "Failed to fetch products" }
        }
    })
    // POST /api/products  – list a new product
    .post("/", async ({ body, set }: any) => {
        try {
            await connect()
            const user = await currentUser()
            if (!user) {
                set.status = 401
                return { error: "Unauthorized" }
            }

            const { name, price, description, category, condition, imageUrl } = body

            if (!name || !price) {
                set.status = 400
                return { error: "name and price are required" }
            }

            const newProduct = await Product.create({
                name,
                price: Number(price),
                description: description || "",
                category: category || "Other",
                condition: condition || "Good",
                imageUrl: imageUrl || "",
                listedBy: user.fullName || user.username || "Anonymous",
                sellerId: user.id,
                date: new Date()
            })

            return { success: true, product: newProduct }
        } catch (error: any) {
            console.error("[API] Error creating product:", error)
            set.status = 500
            return { error: error.message || "Failed to create product" }
        }
    })

// ─── App ─────────────────────────────────────────────────────────────
const app = new Elysia({ prefix: '/api' })
    .use(room)
    .use(products)

export const GET = app.fetch
export const POST = app.fetch

export type App = typeof app