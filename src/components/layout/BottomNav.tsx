import { Upload, ShoppingBag, User, GraduationCap, CalendarDays, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface BottomNavProps {
    onCenterClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onCenterClick }) => {
    const location = useLocation();
    const { t } = useLanguage();
    const isDashboard = location.pathname === "/dashboard";

    const navItems = [
        { path: "/classes", icon: GraduationCap, label: t("classes") },
        { path: "/schedule", icon: CalendarDays, label: t("schedule") },
        { path: isDashboard ? "/upload" : "/dashboard", icon: isDashboard ? Upload : Home, label: isDashboard ? t("post") : t("home"), isCenter: true },
        { path: "/marketplace", icon: ShoppingBag, label: t("marketplace") },
        { path: "/profile", icon: User, label: t("profile") },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto md:max-w-xl lg:max-w-2xl">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isCenterButton = 'isCenter' in item && item.isCenter;
                    const Icon = item.icon;
                    const navPath = item.path;

                    if (isCenterButton && onCenterClick && isDashboard) {
                        return (
                            <button
                                key={item.path}
                                onClick={onCenterClick}
                                className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 px-1 rounded-xl transition-all duration-200",
                                "relative -top-5 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-[0_14px_30px_-12px_rgba(14,165,233,0.65)] ring-4 ring-background active:scale-95"
                            )}
                        >
                            <item.icon className="h-7 w-7 md:h-8 md:w-8 scale-110 transition-transform" />
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            to={navPath}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 px-1 rounded-xl transition-all duration-200",
                                isCenterButton
                                    ? "relative -top-5 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-[0_14px_30px_-12px_rgba(14,165,233,0.65)] ring-4 ring-background active:scale-95"
                                    : isActive
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground hover:text-foreground active:scale-95"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 md:h-6 md:w-6 transition-transform",
                                (isActive || isCenterButton) && "scale-110",
                                isCenterButton && "h-7 w-7 md:h-8 md:w-8"
                            )} />
                            {!isCenterButton && (
                                <span className={cn(
                                    "text-[10px] md:text-[11px] font-medium transition-all truncate w-full text-center",
                                )}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
