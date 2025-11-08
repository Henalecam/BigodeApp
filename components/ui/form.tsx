"use client"

import * as React from "react"
import { FormProvider, useFormContext, Controller } from "react-hook-form"
import { cn } from "@/lib/utils"

const Form = FormProvider

export type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>({ name: "" })

const FormField = ({
  name,
  render
}: {
  name: string
  render: (field: ReturnType<typeof useFormField>) => React.ReactNode
}) => {
  const methods = useFormContext()
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        control={methods.control}
        name={name}
        render={({ field, fieldState }) =>
          render({
            field,
            fieldState,
            formState: methods.formState
          })
        }
      />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    name: fieldContext.name,
    formItemId: `${fieldContext.name}-form-item`,
    formDescriptionId: `${fieldContext.name}-form-item-description`,
    formMessageId: `${fieldContext.name}-form-item-message`,
    fieldState
  }
}

const FormItemContext = React.createContext<string>("")

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()
    return (
      <FormItemContext.Provider value={id}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField()
  return <label ref={ref} className={cn("text-sm font-medium", className)} htmlFor={formItemId} {...props} />
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { formItemId } = useFormField()
    return <div ref={ref} className={cn(className)} id={formItemId} {...props} />
  }
)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()
  return <p ref={ref} className={cn("text-sm text-neutral-500", className)} id={formDescriptionId} {...props} />
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { formMessageId, fieldState } = useFormField()
  const body = fieldState.error ? fieldState.error.message : children
  if (!body) return null
  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-danger", className)}
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField }

