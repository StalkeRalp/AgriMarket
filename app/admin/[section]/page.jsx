import AdminSection from "@/composants/AdminSection";

export default async function Page({ params }) { const { section } = await params; return <AdminSection section={section} />; }
