import ProductEditor from "@/modules/produits/composants/ProductEditor";
export default async function Page({ params }) { const { id } = await params; return <ProductEditor id={id} />; }
