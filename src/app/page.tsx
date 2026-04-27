"use client"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import Header from "@/components/header"
import { Search, Loader2, PackageX } from "lucide-react";
import Filters from "@/components/filters";
import ProductCard from "@/components/productCard";
import Footer from "@/components/footer";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { useState } from "react";

interface Product {
  _id: string
  name: string
  price: number
  imageUrl: string
  listedBy: string
  sellerId: string
  category: string
  condition: string
  description: string
  date: string
}

export default function Home() {
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await client.products.get()
      if (res.status !== 200) throw new Error("Failed to fetch products")
      return (res.data as any).products as Product[]
    },
    staleTime: 30_000,
  })

  const filtered = (data ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="mx-auto px-6 py-0.5 mt-0">
        <InputGroup className="max-w-screen">
          <InputGroupInput
            placeholder="Search products…"
            className="text-[#3a77ff]"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <InputGroupAddon align="inline-end"><Search className="text-[#3a77ff]" /></InputGroupAddon>
        </InputGroup>
        <Filters />

        {isLoading && (
          <div className="flex items-center justify-center py-24 gap-3 text-[#3a77ff]">
            <Loader2 className="animate-spin h-6 w-6" />
            <span className="text-sm font-medium">Loading products…</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center py-24 gap-3 text-red-500">
            <PackageX className="h-10 w-10" />
            <p className="text-sm">Failed to load products.</p>
            <button onClick={() => refetch()} className="text-[#3a77ff] underline text-sm">Try again</button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-3 text-gray-400">
            <PackageX className="h-10 w-10" />
            <p className="text-sm">No products found{search ? ` for "${search}"` : ""}.</p>
            <Link href="/sell" className="text-[#3a77ff] underline text-sm">Be the first to list one →</Link>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
            {filtered.map((item) => (
              <Link key={item._id} href={`/product/${item._id}`}>
                <ProductCard
                  src={item.imageUrl || "/placeholder.jpg"}
                  price={`₹${item.price}`}
                  name={item.name}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
