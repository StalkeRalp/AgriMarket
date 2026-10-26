import AdminLayout from "@/composants/AdminLayout";

export const metadata = { title: "Administration | AgriMarket", robots: { index: false, follow: false } };

export default function Layout({ children }) { return <AdminLayout>{children}</AdminLayout>; }
