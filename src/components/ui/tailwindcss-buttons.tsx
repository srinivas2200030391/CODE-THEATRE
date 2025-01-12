"use client";
import React from "react";
import { IconClipboard } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export const ButtonsCard = ({
    children,
    className,
    onClick,
}: {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => {
    return (
        <div
            onClick={onClick}
            className={cn("relative group/btn cursor-pointer", className)}
        >
            {/* Background overlay with pointer-events disabled */}
            <div
                className="absolute inset-0 dark:bg-dot-white/[0.1] bg-dot-black/[0.1] pointer-events-none"
            />
            {/* Clipboard icon */}
            <IconClipboard className="absolute top-2 right-2 text-neutral-300 group-hover/btn:block hidden h-4 w-4 transition duration-200" />
            {/* Children */}
            <div className="relative z-40">{children}</div>
        </div>
    );
};
