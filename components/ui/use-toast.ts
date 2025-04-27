"use client"

import type React from "react"

import { useToast as useToastOriginal } from "@/components/ui/toast"

export const useToast = useToastOriginal

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
}

function toast(props: Omit<Toast, "id">) {
  console.log("Toast called with:", props)
}

export { toast }
