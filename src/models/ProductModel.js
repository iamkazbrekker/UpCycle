import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Untitled"
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: "Other"
    },
    condition: {
        type: String,
        enum: ["New", "Like New", "Good", "Fair", "Poor"],
        default: "Good"
    },
    imageUrl: {
        type: String,
        default: ""
    },
    listedBy: {
        type: String,
        required: true
    },
    sellerId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const Product = mongoose.models.products || mongoose.model("products", ProductSchema)

export default Product