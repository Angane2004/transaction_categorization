import Sidebar from "@/components/Sidebar";
import { PinLock } from "@/components/PinLock";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <Sidebar />
            <main className="md:pl-72 pb-10 relative">
                <PinLock>
                    {children}
                </PinLock>
            </main>
        </div>
    );
}
