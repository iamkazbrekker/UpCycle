"use client"
import Header from "@/components/header";
import { useParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ArrowLeft, Search } from "lucide-react";
import data from '@/data/values.json'
import Link from "next/link";
import Footer from "@/components/footer";
import ProductPageCard from "@/components/productPageCard";
import { nanoid } from "nanoid";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";


function Page() {
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
 
  const chatId = `${user?.fullName}+${currentProduct.productId}`
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

        <div>
          <ProductPageCard currentProduct={currentProduct} chatId={chatId} />
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