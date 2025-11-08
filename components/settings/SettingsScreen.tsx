"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { barbershopSettingsSchema, profileSettingsSchema } from "@/lib/validations/settings"

type BarbershopFormValues = z.infer<typeof barbershopSettingsSchema>
type ProfileFormValues = z.infer<typeof profileSettingsSchema>

type SettingsScreenProps = {
  barbershop: {
    name: string
    phone: string
    address: string
  }
  profile: {
    name: string
    email: string
  }
  canManageBarbershop: boolean
}

export function SettingsScreen({ barbershop, profile, canManageBarbershop }: SettingsScreenProps) {
  const { addToast } = useToast()
  const [barbershopLoading, setBarbershopLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const barbershopForm = useForm<BarbershopFormValues>({
    resolver: zodResolver(barbershopSettingsSchema),
    defaultValues: {
      name: barbershop.name,
      phone: barbershop.phone,
      address: barbershop.address
    }
  })

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: profile.name
    }
  })

  const handleBarbershopSubmit = async (values: BarbershopFormValues) => {
    setBarbershopLoading(true)
    try {
      const response = await fetch("/api/settings/barbershop", {
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
          title: "Erro ao atualizar dados",
          description: json.error ?? "Tente novamente"
        })
      } else {
        addToast({
          variant: "success",
          title: "Dados da barbearia atualizados"
        })
      }
    } finally {
      setBarbershopLoading(false)
    }
  }

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setProfileLoading(true)
    try {
      const response = await fetch("/api/settings/profile", {
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
          title: "Erro ao atualizar perfil",
          description: json.error ?? "Tente novamente"
        })
      } else {
        addToast({
          variant: "success",
          title: "Perfil atualizado"
        })
      }
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Dados da barbearia</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...barbershopForm}>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={barbershopForm.handleSubmit(handleBarbershopSubmit)}>
              <FormField
                control={barbershopForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nome comercial</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da barbearia" autoFocus {...field} disabled={!canManageBarbershop} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={barbershopForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 11 90000-0000" {...field} disabled={!canManageBarbershop} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={barbershopForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número e bairro" {...field} disabled={!canManageBarbershop} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {canManageBarbershop ? (
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={barbershopLoading}>
                    Salvar alterações
                  </Button>
                </div>
              ) : (
                <p className="sm:col-span-2 text-xs text-neutral-500">
                  Apenas administradores podem alterar os dados da barbearia.
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Seu perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-500">Email: {profile.email}</p>
          <Form {...profileForm}>
            <form className="space-y-4" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={profileLoading}>
                  Atualizar perfil
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}




