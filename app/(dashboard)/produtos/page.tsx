"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { ProductsScreen } from "@/components/products/ProductsScreen"
import { useSession } from "@/lib/session-store"

export default function ProductsPage() {
  const { role } = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = getDb()
    const productsData = db.products
      .filter(p => p.barbershopId === "barbershop-1")
      .map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        minStock: product.minStock,
        salePrice: product.salePrice,
        isActive: product.isActive
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    console.log("Products data:", productsData)
    setProducts(productsData)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  return <ProductsScreen products={products} canManage={role === "ADMIN"} />
}
