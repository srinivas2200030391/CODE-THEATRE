"use client"
import { useCodeEditorStore } from '@/store/useCodeEditorStore'
import React, { useEffect, useRef, useState } from 'react'
import { THEMES } from '../_constants'
import { motion } from 'framer-motion'
export default function ThemeSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const { theme, setTheme } = useCodeEditorStore()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const currentTheme = THEMES.find((t) => t.id === theme)


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside)
    })
    return (

        <div className='relative' ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-48 group relative flex items-center gap-2 px-4 py-2.5 bg-[#1e1e2e]/80 hover:bg-[#262637] 
        rounded-lg transition-all duration-200 border border-gray-800/50 hover:border-gray-700"
            >

            </motion.button>

        </div>
    )
}
