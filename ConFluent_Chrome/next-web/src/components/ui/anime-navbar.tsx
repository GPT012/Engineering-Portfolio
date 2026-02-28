"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
    defaultActive?: string
}

export function AnimeNavBar({ items, className, defaultActive = "Home" }: NavBarProps) {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const [hoveredTab, setHoveredTab] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>(defaultActive)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Ensure active tab matches pathname if possible
    useEffect(() => {
        const currentItem = items.find(item => item.url === pathname)
        if (currentItem) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab(currentItem.name)
        }
    }, [pathname, items])

    if (!mounted) return null

    return (
        <div className={cn("fixed top-5 left-0 right-0 z-[9999]", className)}>
            <div className="flex justify-center pt-6">
                <motion.div
                    className="flex items-center gap-3 bg-[#0a0a0b]/80 border border-white/5 backdrop-blur-2xl py-2 px-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative font-heading"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 30,
                    }}
                >
                    <div className="md:hidden px-4 text-white font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">ConFluent</div>
                    {items.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.name
                        const isHovered = hoveredTab === item.name

                        return (
                            <Link
                                key={item.name}
                                href={item.url}
                                onClick={() => {
                                    setActiveTab(item.name)
                                }}
                                onMouseEnter={() => setHoveredTab(item.name)}
                                onMouseLeave={() => setHoveredTab(null)}
                                className={cn(
                                    "relative cursor-pointer text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300",
                                    "text-white/40 hover:text-white",
                                    isActive && "text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: [0.2, 0.4, 0.2],
                                            scale: [1, 1.01, 1]
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 rounded-full blur-md" />
                                        <div className="absolute inset-[-4px] bg-white/5 rounded-full blur-xl" />

                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                                            style={{
                                                animation: "shine 4s ease-in-out infinite"
                                            }}
                                        />
                                    </motion.div>
                                )}

                                <motion.span
                                    className="hidden md:inline relative z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.name}
                                </motion.span>
                                <motion.span
                                    className="md:hidden relative z-10"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon size={18} strokeWidth={2.5} />
                                </motion.span>

                                <AnimatePresence>
                                    {isHovered && !isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute inset-0 bg-white/[0.03] rounded-full -z-10"
                                        />
                                    )}
                                </AnimatePresence>
                            </Link>
                        )
                    })}
                </motion.div>
            </div>
        </div>
    )
}
