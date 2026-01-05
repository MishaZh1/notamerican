import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
    src?: string | null
    name?: string | null
    size?: "sm" | "md" | "lg"
    className?: string
}

export function UserAvatar({ src, name, size = "md", className = "" }: UserAvatarProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-lg"
    }

    const getInitials = (name?: string | null) => {
        if (!name) return "?"
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Avatar className={`${sizeClasses[size]} ${className}`}>
            <AvatarImage src={src || undefined} alt={name || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    )
}
