"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { client } from "@/lib/client"
import {
    Package,
    Tag,
    FileText,
    DollarSign,
    Image as ImageIcon,
    Star,
    ChevronDown,
    ArrowLeft,
    Loader2,
    CheckCircle2,
} from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
    "Books", "Electronics", "Clothing", "Furniture",
    "Sports", "Toys", "Music", "Art", "Kitchen", "Other"
]

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"]

export default function SellPage() {
    const router = useRouter()
    const { isLoaded, isSignedIn, user } = useUser()

    const [form, setForm] = useState({
        name: "",
        price: "",
        description: "",
        category: "Books",
        condition: "Good",
        imageUrl: "",
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError("")
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!isSignedIn) {
            setError("You must be signed in to list a product.")
            return
        }
        if (!form.name.trim() || !form.price) {
            setError("Product name and price are required.")
            return
        }
        if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
            setError("Please enter a valid price.")
            return
        }

        setLoading(true)
        setError("")
        try {
            const res = await client.products.post({
                name: form.name.trim(),
                price: Number(form.price),
                description: form.description.trim(),
                category: form.category,
                condition: form.condition,
                imageUrl: form.imageUrl.trim(),
            })

            if (res.status === 200) {
                setSuccess(true)
                setTimeout(() => router.push("/"), 2000)
            } else {
                const errMsg = (res.error as any)?.value?.error || "Failed to list product."
                setError(errMsg)
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#3a77ff] h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#f0f5ff] via-white to-[#e8f0fe]">
            <Header />
            <main className="mx-auto max-w-2xl px-6 py-8">

                {/* Back link */}
                <Link href="/" className="inline-flex items-center gap-1.5 text-[#3a77ff] mb-6 hover:underline text-sm font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back to feed
                </Link>

                {/* Hero heading */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">List a Product</h1>
                    <p className="text-gray-500 mt-1">Fill in the details below and give your item a new home 🌱</p>
                </div>

                {/* Success state */}
                {success ? (
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                        <h2 className="text-xl font-semibold text-gray-800">Product listed successfully!</h2>
                        <p className="text-gray-500">Redirecting you to the feed…</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-blue-100/40 border border-gray-100 p-8 flex flex-col gap-6">

                        {/* Product Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="name">
                                <Package className="h-4 w-4 text-[#3a77ff]" /> Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. H. C. Verma Vol. 1"
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a77ff]/40 focus:border-[#3a77ff] transition"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="price">
                                <DollarSign className="h-4 w-4 text-[#3a77ff]" /> Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="1"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="e.g. 340"
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a77ff]/40 focus:border-[#3a77ff] transition"
                                required
                            />
                        </div>

                        {/* Category + Condition row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="category">
                                    <Tag className="h-4 w-4 text-[#3a77ff]" /> Category
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a77ff]/40 focus:border-[#3a77ff] transition bg-white"
                                    >
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="condition">
                                    <Star className="h-4 w-4 text-[#3a77ff]" /> Condition
                                </label>
                                <div className="relative">
                                    <select
                                        id="condition"
                                        name="condition"
                                        value={form.condition}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a77ff]/40 focus:border-[#3a77ff] transition bg-white"
                                    >
                                        {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="description">
                                <FileText className="h-4 w-4 text-[#3a77ff]" /> Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe your item — condition, edition, any defects…"
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a77ff]/40 focus:border-[#3a77ff] transition resize-none"
                            />
                        </div>

                        {/* Image URL */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="imageUrl">
                                <ImageIcon className="h-4 w-4 text-[#3a77ff]" /> Image URL <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                value={form.imageUrl}
                                onChange={handleChange}
                                placeholder="https://…"
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a77ff]/40 focus:border-[#3a77ff] transition"
                            />
                            {/* Image preview */}
                            {form.imageUrl && (
                                <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden max-h-52 flex items-center justify-center bg-gray-50">
                                    <img src={form.imageUrl} alt="preview" className="max-h-52 object-contain" />
                                </div>
                            )}
                        </div>

                        {/* Seller info (read-only) */}
                        {isSignedIn && (
                            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                                Listing as <span className="font-semibold">{user.fullName || user.username || "Anonymous"}</span>
                            </div>
                        )}

                        {!isSignedIn && (
                            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                                ⚠️ You must be <Link href="/sign-in" className="underline font-semibold">signed in</Link> to list a product.
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !isSignedIn}
                            className="w-full rounded-full bg-[#3a77ff] text-white font-semibold py-3 text-sm hover:bg-[#2560e0] active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Listing…</> : "🚀 List Product"}
                        </button>
                    </form>
                )}
            </main>
            <Footer />
        </div>
    )
}
