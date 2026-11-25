"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

type PasswordFieldProps = {
  name: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PasswordField({
  name,
  placeholder = "Senha",
  value,
  onChange,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex items-center space-x-2">
      <Input
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => setVisible((v) => !v)}
        className="rounded-full p-1"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </Button>
    </div>
  )
}
