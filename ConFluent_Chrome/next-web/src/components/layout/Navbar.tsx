"use client"

import * as React from "react"
import { Home, FileText, CreditCard, Info, User } from "lucide-react"
import { AnimeNavBar } from "@/components/ui/anime-navbar"

const items = [
    {
        name: "Home",
        url: "/",
        icon: Home,
    },
    {
        name: "Dashboard",
        url: "/dashboard",
        icon: User,
    },
    {
        name: "Pricing",
        url: "/pricing",
        icon: CreditCard,
    },
    {
        name: "Privacy",
        url: "/privacy",
        icon: Info,
    },
]

export function Navbar() {
    return <AnimeNavBar items={items} defaultActive="Home" />
}
