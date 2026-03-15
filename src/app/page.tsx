"use client"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import Header from "@/components/header"
import { Search } from "lucide-react";
import Filters from "@/components/filters";
import ProductCard from "@/components/productCard";
import products from "@/data/values.json"
import Footer from "@/components/footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="mx-auto  px-6 py-0.5 mt-0">
        <InputGroup className="max-w-screen">
          <InputGroupInput placeholder="Search..." className="text-[#3a77ff]" />
          <InputGroupAddon align="inline-end"><Search className="text-[#3a77ff]" /></InputGroupAddon>
        </InputGroup>
        <Filters />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
          {products.products.map((item) => (
            <Link key={item.productId} href={`/product/${item.productId}`}>
              <ProductCard
                src={item.src}
                price={item.price}
                name={item.name}
              />
            </Link>
          ))}
        </div>
      </main>
      <Footer />

    </div>
  );

}
