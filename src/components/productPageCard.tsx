import { Heart, Share2 } from "lucide-react"
import Link from "next/link"

type Product = {
    productId: string
    src: string
    price: string
    name: string
    date: string
    soldBy: string
}
function ProductPageCard({ currentProduct, chatId }: { currentProduct: Product, chatId: String }) {

    return (
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
                <Link href={`/chat/${currentProduct.soldBy}/${chatId}`} className="border-2 border-[#3a77ff] rounded-full text-[#3a77ff] py-1 px-3 w-[60%] text-center mt-2 mb-5 self-center">
                    <div>
                        Chat With Seller
                    </div>
                </Link>
            </div>
        </div>
    )
}
export default ProductPageCard