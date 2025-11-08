"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"

const loginSchema = z.object({
  email: z.string().email("Informe um email válido"),
  password: z.string().min(6, "Senha inválida")
})

export default function LoginPage() {
  const { addToast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const error = searchParams.get("error")

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true)
    const response = await signIn("credentials", { ...values, redirect: false })
    setLoading(false)
    if (response?.error) {
      addToast({
        variant: "destructive",
        title: "Falha no login",
        description: "Verifique suas credenciais"
      })
      return
    }
    router.replace("/")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-primary">Entrar</h1>
        <p className="text-sm text-neutral-500">Acesse sua conta BarberPro</p>
        {error ? (
          <div className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            Sessão expirada. Faça login novamente.
          </div>
        ) : null}
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" autoComplete="email" autoFocus {...field} />
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
                  <Input type="password" placeholder="Sua senha" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>
      <p className="text-sm text-neutral-600">
        Não possui conta?{" "}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
          Criar conta
        </Link>
      </p>
    </div>
  )
}

