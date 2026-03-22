import * as React from 'react'
import { MenuIcon } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from "next/link";

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href} className="flex flex-col gap-1 text-sm">
                    <div className="leading-none font-medium">{title}</div>
                    <div className="line-clamp-2 text-muted-foreground">
                        {children}
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}

function Header() {

    return (
        <div>
            <header className="flex flex-row gap-0.5 m-2.5 text-[#3a77ff] items-center pb-2 z-50">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger><MenuIcon className="text-[#3a77ff]" /></NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="w-96 max-w-[90vw] text-[#3a77ff]">
                                    <ListItem href="/orders" title="Orders">
                                        See Your Past Orders
                                    </ListItem>
                                    <ListItem href="/account" title="Account">
                                        Account and Security
                                    </ListItem>
                                    <ListItem href="/sell" title="Sell">
                                        List the products you want to sell
                                    </ListItem>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <Link href="/">
                    <h1 className="font-bold text-2xl ml-0">
                        UpCycle
                    </h1>
                </Link>
            </header>
        </div>
    )
}

export default Header