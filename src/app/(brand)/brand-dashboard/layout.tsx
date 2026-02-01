import { BrandBottomNav } from "@/components/brand-dashboard/BrandBottomNav";

export default function BrandDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            {/* Bottom padding so content is not hidden behind fixed nav */}
            <div className="h-20 shrink-0 sm:h-24" aria-hidden />
            <BrandBottomNav />
        </>
    );
}
