"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Wand2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import useStreamResponse from "@/components/useStreamResponse"

export default function ClientForm() {
  const [sentence, setSentence] = useState<string>("")
  const { startStream, isLoading, responses } = useStreamResponse({
    streamCallback: setSentence,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "Enter") {
        startStream(sentence)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [sentence, startStream])

  return (
    <div className="flex flex-col gap-5">
      <div className="text-2xl font-bold">
        <h3>Pomocnik AI</h3>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          startStream(sentence)
        }}
        className="w-fullflex flex-col gap-5"
      >
        <Label htmlFor="message">Message</Label>
        <div className="flex flex-row">
          <Textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Your message"
            className="pr-14 text-base"
            rows={10}
          />
          <motion.button
            type="submit"
            className="-ml-14"
            // You may need to add a motion library for animations
            animate={{
              rotate: isLoading ? 360 : 0,
              scale: isLoading ? [1.2, 1.4, 0.5] : 1,
            }}
            transition={{ duration: 1 }}
          >
            <Wand2 />
          </motion.button>
        </div>
      </form>
    </div>
  )
}
