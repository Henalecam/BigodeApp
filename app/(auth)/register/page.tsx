"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"

const registerSchema = z
  .object({
    barbershopName: z.string().min(3),
    barbershopPhone: z.string().min(10),
    barbershopAddress: z.string().min(5),
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam ser iguais"
  })

export default function RegisterPage() {
  const { addToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      barbershopName: "",
      barbershopPhone: "",
      barbershopAddress: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true)
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    })
    setLoading(false)
    const json = await response.json()
    if (!json.success) {
      addToast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: json.error ?? "Tente novamente"
      })
      return
    }
    addToast({
      variant: "success",
      title: "Conta criada",
      description: "Agora é só fazer login"
    })
    router.push("/login")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-primary">Criar conta</h1>
        <p className="text-sm text-neutral-500">Cadastre sua barbearia e comece a usar o BarberPro</p>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="barbershopName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da barbearia</FormLabel>
                  <FormControl>
                    <Input placeholder="Barbearia Exemplo" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barbershopPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone comercial</FormLabel>
                  <FormControl>
                    <Input placeholder="+55 11 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barbershopAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua e número" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Crie uma senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Repita a senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </Form>
      <p className="text-sm text-neutral-600">
        Já possui conta?{" "}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">
          Acessar
        </Link>
      </p>
    </div>
  )
}

