"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowUp, Plus, Moon, Sun, Sliders, X, Settings, Key } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { OrbitalBackground } from "@/components/orbital-background"
import { ApiKeySettings, getApiKey, hasApiKey, getRequiredKeyForModel } from "@/components/api-key-settings"

type Mode = "chat" | "troubleshoot"
type Theme = "light" | "dark"

type ModelInfo = {
  name: string
  provider: "openai" | "anthropic" | "google"
}

type ModelProvider = {
  name: string
  color: string
  models: ModelInfo[]
}

const modelProviders: ModelProvider[] = [
  {
    name: "OpenAI",
    color: "bg-teal-500",
    models: [
      { name: "GPT-4o", provider: "openai" },
      { name: "GPT-4 Turbo", provider: "openai" },
      { name: "o1", provider: "openai" },
      { name: "o1-mini", provider: "openai" },
    ],
  },
  {
    name: "Google",
    color: "bg-purple-500",
    models: [
      { name: "Gemini 1.5 Flash", provider: "google" },
      { name: "Gemini 1.5 Pro", provider: "google" },
    ],
  },
  {
    name: "Anthropic",
    color: "bg-orange-500",
    models: [
      { name: "Claude Sonnet", provider: "anthropic" },
      { name: "Claude Opus", provider: "anthropic" },
    ],
  },
]

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>("chat")
  const [theme, setTheme] = useState<Theme>("light")
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("GPT-4o")
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    google: "",
  })
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string }[]>([
    { id: "1", title: "Project Setup Guide" },
    { id: "2", title: "API Integration Help" },
    { id: "3", title: "Database Optimization" },
  ])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else if (systemPrefersDark) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }

    // Load API keys
    setApiKeys({
      openai: getApiKey("openai"),
      anthropic: getApiKey("anthropic"),
      google: getApiKey("google"),
    })

    // Listen for API key updates
    const handleApiKeysUpdated = () => {
      setApiKeys({
        openai: getApiKey("openai"),
        anthropic: getApiKey("anthropic"),
        google: getApiKey("google"),
      })
    }
    window.addEventListener("apiKeysUpdated", handleApiKeysUpdated)
    return () => window.removeEventListener("apiKeysUpdated", handleApiKeysUpdated)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const { messages, sendMessage, status } = useChat({
    api: "/api/chat",
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(input, {
        ...init,
        body: init?.body
          ? JSON.stringify({
              ...JSON.parse(init.body as string),
              apiKeys,
              selectedModel,
            })
          : JSON.stringify({ apiKeys, selectedModel }),
      })
      return response
    },
  })

  const canUseModel = (modelName: string): boolean => {
    const requiredKey = getRequiredKeyForModel(modelName)
    if (!requiredKey) return false
    return hasApiKey(requiredKey)
  }

  const isChatDisabled = !canUseModel(selectedModel) || status === "in_progress"

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const message = formData.get("message") as string

    if (message.trim()) {
      sendMessage({ text: message })
      e.currentTarget.reset()
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10" />
      <OrbitalBackground />

      <div className="min-h-screen flex">
        {/* Left sidebar */}
        <div className="w-64 bg-slate-950/80 backdrop-blur-sm border-r border-slate-800 flex flex-col p-4 gap-4">
          <Button
            onClick={() => {}}
            variant="outline"
            className="w-full justify-start gap-2 border-slate-700 hover:bg-slate-900"
          >
            <Plus className="w-4 h-4" />
            New chat
          </Button>

          <div className="flex-1 overflow-y-auto space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-2">History</p>
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors truncate"
              >
                {chat.title}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">User</p>
              <p className="text-xs text-slate-500 truncate">user@example.com</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="absolute top-6 right-6 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="h-10 w-10 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              title="API Key Settings"
            >
              <Key className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="h-10 w-10 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              title="Toggle models sidebar"
            >
              <Sliders className="w-5 h-5" />
              <span className="sr-only">Toggle models</span>
            </Button>
          </div>

          <Card className="w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden bg-slate-950/95 backdrop-blur border-slate-800/50 rounded-2xl border-2 border-gradient-to-r from-teal-500/30 via-purple-500/30 to-coral-500/30">
            {/* Header */}
            <div className="border-b border-slate-800 px-8 py-6 flex flex-col items-center gap-6 shrink-0 bg-slate-950/50">
              <img
                src="/images/lucid-origin-logo-for-trifectai-triangle-made-of-three-connec-0-removebg-preview-removebg-preview.png"
                alt="Quorum"
                className="h-20 w-auto"
              />

              <div className="flex flex-col items-center gap-3">
                <div className="text-sm text-slate-400">
                  Selected: <span className="text-slate-200 font-medium">{selectedModel}</span>
                </div>
                {!canUseModel(selectedModel) && (
                  <div className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
                    API key required. Click the <Key className="w-3 h-3 inline mx-1" /> icon to add your keys.
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-center p-1 bg-slate-900 border border-slate-700 rounded-full">
                <button
                  onClick={() => setMode("chat")}
                  className={`px-6 py-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 rounded-full ${
                    mode === "chat"
                      ? "bg-gradient-to-r from-teal-500 to-purple-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setMode("troubleshoot")}
                  className={`px-6 py-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 rounded-full ${
                    mode === "troubleshoot"
                      ? "bg-gradient-to-r from-teal-500 to-purple-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Troubleshoot
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-lg font-semibold text-slate-200">Start a conversation</p>
                  <p className="text-sm text-slate-400">Three minds. One answer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`relative max-w-[70%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-teal-600 to-purple-600 text-white shadow-lg"
                            : "bg-slate-900 text-slate-100 border border-slate-800 shadow-lg"
                        }`}
                      >
                        {message.parts.map((part, index) => {
                          if (part.type === "text") {
                            return (
                              <p key={index} className="whitespace-pre-wrap break-words">
                                {part.text}
                              </p>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  ))}

                  {status === "in_progress" && (
                    <div className="flex justify-start">
                      <div className="relative max-w-[70%] px-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-slate-800 px-6 py-4 shrink-0 bg-slate-950/50">
              <form onSubmit={handleSubmit} className="flex gap-3 relative">
                <Input
                  ref={inputRef}
                  name="message"
                  placeholder={isChatDisabled && !canUseModel(selectedModel) ? "API key required..." : "Message..."}
                  disabled={isChatDisabled}
                  className="flex-1 h-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  autoComplete="off"
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isChatDisabled}
                  size="icon"
                  className="shrink-0 h-10 w-10 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 disabled:opacity-50"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="absolute -bottom-10 right-0 h-8 w-8 text-slate-500 hover:text-slate-300 opacity-50 hover:opacity-75 transition-all"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div
          className={`w-80 bg-slate-950/80 backdrop-blur-sm border-l border-slate-800 flex flex-col transition-transform duration-300 ${
            rightSidebarOpen ? "translate-x-0" : "translate-x-full"
          } fixed right-0 top-0 h-full z-20`}
        >
          {/* Sidebar header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Models</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Models list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {modelProviders.map((provider) => (
              <div key={provider.name} className="space-y-2">
                <h3 className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{provider.name}</h3>
                <div className="space-y-1">
                  {provider.models.map((model) => {
                    const hasKey = canUseModel(model.name)
                    const isSelected = selectedModel === model.name
                    return (
                      <button
                        key={model.name}
                        onClick={() => setSelectedModel(model.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                          isSelected
                            ? "bg-slate-800 border border-slate-700"
                            : hasKey
                            ? "hover:bg-slate-900/50"
                            : "opacity-50 hover:opacity-70 hover:bg-slate-900/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                          <span className="text-sm text-slate-300">{model.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-teal-500" />
                          )}
                          {!hasKey && (
                            <Key className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ApiKeySettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
