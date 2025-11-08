"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ProductForm, ProductFormValues } from "@/components/products/ProductForm"

type ProductData = {
  id: string
  name: string
  stock: number
  minStock: number
  salePrice: number
  isActive: boolean
}

type ProductsScreenProps = {
  products: ProductData[]
  canManage: boolean
}

export function ProductsScreen({ products: defaultProducts, canManage }: ProductsScreenProps) {
  const { addToast } = useToast()
  const [products, setProducts] = useState(defaultProducts)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const editingProduct = products.find(product => product.id === editingId)

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true)
    try {
      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        })
        const json = await response.json()
        if (!json.success) {
          addToast({
            variant: "destructive",
            title: "Erro ao atualizar produto",
            description: json.error ?? "Revise os dados"
          })
        } else {
          setProducts(prev => prev.map(product => (product.id === editingProduct.id ? json.data : product)))
          addToast({
            variant: "success",
            title: "Produto atualizado"
          })
          setOpen(false)
        }
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        })
        const json = await response.json()
        if (!json.success) {
          addToast({
            variant: "destructive",
            title: "Erro ao cadastrar produto",
            description: json.error ?? "Tente novamente"
          })
        } else {
          setProducts(prev => [...prev, json.data])
          addToast({
            variant: "success",
            title: "Produto cadastrado"
          })
          setOpen(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (product: ProductData) => {
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isActive: !product.isActive })
    })
    const json = await response.json()
    if (!json.success) {
      addToast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: json.error ?? "Tente novamente"
      })
      return
    }
    setProducts(prev => prev.map(item => (item.id === product.id ? json.data : item)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Produtos</h1>
          <p className="text-sm text-neutral-500">Controle de estoque e vendas</p>
        </div>
        {canManage ? (
          <Button
            onClick={() => {
              setEditingId(null)
              setOpen(true)
            }}
          >
            Novo produto
          </Button>
        ) : null}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            {canManage ? <TableHead className="text-right">Ações</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell className={product.stock < product.minStock ? "text-danger font-medium" : ""}>
                {product.stock}
              </TableCell>
              <TableCell>{product.minStock}</TableCell>
              <TableCell>{formatCurrency(product.salePrice)}</TableCell>
              <TableCell>
                <Badge variant={product.isActive ? "success" : "outline"}>
                  {product.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              {canManage ? (
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggle(product)}>
                    {product.isActive ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(product.id)
                      setOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            loading={loading}
            initialData={
              editingProduct
                ? {
                    name: editingProduct.name,
                    stock: editingProduct.stock,
                    minStock: editingProduct.minStock,
                    salePrice: editingProduct.salePrice,
                    isActive: editingProduct.isActive
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}