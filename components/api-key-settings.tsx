"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Key, ExternalLink } from "lucide-react"

type ApiKeys = {
  openai: string
  anthropic: string
  google: string
}

const API_KEY_LINKS = {
  openai: "https://platform.openai.com/api-keys",
  anthropic: "https://console.anthropic.com/settings/keys",
  google: "https://aistudio.google.com/app/apikey",
}

const MODEL_REQUIREMENTS = {
  "GPT-4o": "openai",
  "GPT-4 Turbo": "openai",
  "o1": "openai",
  "o1-mini": "openai",
  "Claude Sonnet": "anthropic",
  "Claude Opus": "anthropic",
  "Gemini 1.5 Flash": "google",
  "Gemini 1.5 Pro": "google",
} as const

export function ApiKeySettings({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    google: "",
  })

  useEffect(() => {
    // Load keys from localStorage
    const stored = {
      openai: localStorage.getItem("quorum_api_key_openai") || "",
      anthropic: localStorage.getItem("quorum_api_key_anthropic") || "",
      google: localStorage.getItem("quorum_api_key_google") || "",
    }
    setApiKeys(stored)
  }, [open])

  const handleSave = () => {
    localStorage.setItem("quorum_api_key_openai", apiKeys.openai)
    localStorage.setItem("quorum_api_key_anthropic", apiKeys.anthropic)
    localStorage.setItem("quorum_api_key_google", apiKeys.google)
    onOpenChange(false)
    // Trigger a custom event to notify other components
    window.dispatchEvent(new Event("apiKeysUpdated"))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Settings
          </DialogTitle>
          <DialogDescription>
            Enter your API keys to use Quorum. Keys are stored locally in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>OpenAI API Key</span>
              <a
                href={API_KEY_LINKS.openai}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1"
              >
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKeys.openai}
              onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-100"
            />
            <p className="text-xs text-slate-500">
              Required for: GPT-4o, GPT-4 Turbo, o1, o1-mini
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Anthropic API Key</span>
              <a
                href={API_KEY_LINKS.anthropic}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1"
              >
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <Input
              type="password"
              placeholder="sk-ant-..."
              value={apiKeys.anthropic}
              onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-100"
            />
            <p className="text-xs text-slate-500">
              Required for: Claude Sonnet, Claude Opus
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Google API Key</span>
              <a
                href={API_KEY_LINKS.google}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1"
              >
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <Input
              type="password"
              placeholder="AIza..."
              value={apiKeys.google}
              onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-100"
            />
            <p className="text-xs text-slate-500">
              Required for: Gemini 1.5 Flash, Gemini 1.5 Pro
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600">
            Save Keys
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function getApiKey(provider: "openai" | "anthropic" | "google"): string {
  return localStorage.getItem(`quorum_api_key_${provider}`) || ""
}

export function hasApiKey(provider: "openai" | "anthropic" | "google"): boolean {
  return !!getApiKey(provider)
}

export function getRequiredKeyForModel(modelName: string): "openai" | "anthropic" | "google" | null {
  return MODEL_REQUIREMENTS[modelName as keyof typeof MODEL_REQUIREMENTS] || null
}

