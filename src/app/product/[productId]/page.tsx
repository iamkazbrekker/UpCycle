"use client"
import Header from "@/components/header";
import { useParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ArrowLeft, Heart, Search, Share2 } from "lucide-react";
import data from '@/data/values.json'
import Link from "next/link";
import Footer from "@/components/footer";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { client } from "@/lib/client";


function Page() {

  const router = useRouter()
  const [username, setUsername] = useState("Anonymous")

  var currentProduct = {
    "productId": "",
    "src": "",
    "price": "",
    "name": "",
    "date": "0/0/0",
    "soldBy": ""
  }
  var otherProducts = []
  const params = useParams();
  const currentProductId = params.productId as string;
  const productList = data.products
  for (let index = 0; index < productList.length; index++) {
    if (productList[index].productId == currentProductId) {
      currentProduct = productList[index];
    } else {
      if (otherProducts.length < 5) {
        otherProducts.push(productList[index])
      }
    }
  }
  const { isLoaded, isSignedIn, user } = useUser()
  useEffect(() => {
    if (!isLoaded) {
      setUsername("Loading...");
    } else if (isSignedIn) {
      setUsername(user?.fullName ?? "Anonymous");
    }
  }, [isLoaded, isSignedIn, user]);

  const { mutate: createRoom, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      try {
        const chatId = `${user?.fullName}+${currentProduct.productId}`
        const res = await client.room.post({
          seller: currentProduct.soldBy,
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

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="mx-auto  px-6 py-0.5 mt-0">
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
          <div className="border-b-2 py-4 w-full flex justify-center">
            <img src={currentProduct.src} className="max-h-100 object-contain" />
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
              <h2>{currentProduct.name}</h2>
              <h3 className="text-gray-500">{currentProduct.date}</h3>
            </div>
          </div>

          <div className="w-full flex flex-col m-4">
            <div className="p-2">
              <h1 className="font-semibold">Posted By:</h1>
              <h3>{currentProduct.soldBy}</h3>
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
              <div className="border-2 p-3 rounded-xl relative shrink-0 w-40 aspect-3/4" key={item.productId}>
                <img src={item.src} className="w-full h-[70%] object-contain" />
                <p className="mt-2 text-sm">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

    </div>

  )
}
export default Page