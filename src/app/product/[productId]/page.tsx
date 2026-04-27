"use client"
import Header from "@/components/header";
import { useParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ArrowLeft, Heart, Search, Share2, Tag, Star, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { client } from "@/lib/client";

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

const CONDITION_COLOR: Record<string, string> = {
  "New": "bg-emerald-100 text-emerald-700",
  "Like New": "bg-teal-100 text-teal-700",
  "Good": "bg-blue-100 text-blue-700",
  "Fair": "bg-amber-100 text-amber-700",
  "Poor": "bg-red-100 text-red-700",
}

function Page() {
  const router = useRouter()
  const [username, setUsername] = useState("Anonymous")
  const params = useParams();
  const currentProductId = params.productId as string;

  const { isLoaded, isSignedIn, user } = useUser()
  useEffect(() => {
    if (!isLoaded) {
      setUsername("Loading...");
    } else if (isSignedIn) {
      setUsername(user?.fullName ?? "Anonymous");
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch all products and find current + related
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await client.products.get()
      if (res.status !== 200) throw new Error("Failed to fetch products")
      return (res.data as any).products as Product[]
    },
    staleTime: 30_000,
  })

  const currentProduct = data?.find(p => p._id === currentProductId)
  const otherProducts = data?.filter(p => p._id !== currentProductId).slice(0, 5) ?? []

  const { mutate: createRoom, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      try {
        if (!currentProduct) return
        const chatId = `${user?.fullName}+${currentProduct._id}`
        const res = await client.room.post({
          seller: currentProduct.listedBy,
          buyer: username,
          roomId: chatId
        })

        console.log("API response: ", res)
        if (res.status === 200 && res.data) {
          const roomId = (res.data as any).roomId;
          const seller = (res.data as any).seller;
          if (roomId) {
            router.push(`/chat/${seller}/${roomId}`)
          } else {
            console.error("roomId missing in response data", res.data);
          }
        } else {
          const errorMsg = (res.error as any)?.value?.error || "Unknown server error";
          console.error("Failed to create room:", errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error('Create room exception: ', err)
      }
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header />
        <div className="flex items-center justify-center py-32 gap-3 text-[#3a77ff]">
          <Loader2 className="animate-spin h-7 w-7" />
          <span className="text-sm font-medium">Loading product…</span>
        </div>
      </div>
    )
  }

  if (isError || !currentProduct) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header />
        <div className="flex flex-col items-center py-32 gap-4">
          <p className="text-gray-500">Product not found.</p>
          <Link href="/" className="text-[#3a77ff] underline text-sm">← Back to feed</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="mx-auto px-6 py-0.5 mt-0">
        <div className="flex flex-row justify-between gap-5">
          <Link href="/">
            <ArrowLeft className="text-[#3a77ff] mt-1.5 h-max w-max" />
          </Link>
          <InputGroup className="max-w-screen">
            <InputGroupInput placeholder="Search..." className="text-[#3a77ff]" />
            <InputGroupAddon align="inline-end"><Search className="text-[#3a77ff]" /></InputGroupAddon>
          </InputGroup>
        </div>

        <div className="border-2 rounded-2xl max-h-full my-8 flex flex-col">
          <div className="border-b-2 py-4 w-full flex justify-center bg-gray-50 rounded-t-2xl">
            {currentProduct.imageUrl ? (
              <img src={currentProduct.imageUrl} alt={currentProduct.name} className="max-h-100 object-contain" />
            ) : (
              <div className="h-52 w-full flex items-center justify-center text-gray-300 text-sm">No image</div>
            )}
          </div>

          <div className="border-b-2 w-full">
            <div className="flex flex-row justify-between p-2 pr-3">
              <h1 className="font-bold text-2xl">{`₹${currentProduct.price}`}</h1>
              <div className="flex flex-row gap-3">
                <Share2 />
                <Heart />
              </div>
            </div>
            <div className="flex justify-between px-2 pb-2">
              <h2 className="font-medium">{currentProduct.name}</h2>
              <h3 className="text-gray-500 text-sm">{new Date(currentProduct.date).toLocaleDateString()}</h3>
            </div>

            {/* Category + Condition badges */}
            <div className="flex gap-2 px-2 pb-3">
              {currentProduct.category && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  <Tag className="h-3 w-3" /> {currentProduct.category}
                </span>
              )}
              {currentProduct.condition && (
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${CONDITION_COLOR[currentProduct.condition] ?? "bg-gray-100 text-gray-600"}`}>
                  <Star className="h-3 w-3" /> {currentProduct.condition}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {currentProduct.description && (
            <div className="border-b-2 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <FileText className="h-4 w-4 text-[#3a77ff]" /> Description
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{currentProduct.description}</p>
            </div>
          )}

          <div className="w-full flex flex-col m-4">
            <div className="p-2">
              <h1 className="font-semibold">Posted By:</h1>
              <h3>{currentProduct.listedBy}</h3>
            </div>
            <Button onClick={() => createRoom()}
              disabled={isCreating} className="border-2 border-[#3a77ff] rounded-full text-[#3a77ff] py-1 px-3 w-[60%] text-center mt-2 mb-5 self-center bg-background hover:border-[#0000ff] hover:bg-background hover:font-bold">
              <div>
                Chat With Seller
              </div>
            </Button>
          </div>
        </div>

        <div className="border-t-2 mt-8 p-2 mb-2">
          <h1 className="mb-3 font-semibold">You May Also Like :</h1>
          <div className="flex gap-4 overflow-x-auto overflow-hidden pb-2">
            {otherProducts.map((item) => (
              <Link href={`/product/${item._id}`} key={item._id}>
                <div className="border-2 p-3 rounded-xl relative shrink-0 w-40 aspect-3/4">
                  {item.imageUrl
                    ? <img src={item.imageUrl} className="w-full h-[70%] object-contain" alt={item.name} />
                    : <div className="w-full h-[70%] bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">No image</div>
                  }
                  <p className="mt-2 text-sm">{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
export default Page