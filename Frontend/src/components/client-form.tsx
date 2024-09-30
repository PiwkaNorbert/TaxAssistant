/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Wand2 } from "lucide-react"
import { nanoid } from "nanoid"

import { taxAssistant } from "@/lib/action"
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit"
import { useForm } from "@/lib/hooks/use-form"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useScrollAnchor } from "@/lib/hooks/use-scroll-anchor"

import { EmptyScreen } from "./empty-screen"
import { Button } from "./ui/button"
import { Separator } from "./ui/seperator"
import { Textarea } from "./ui/textarea"

export default function ClientForm({
  declarationType,
  id,
}: {
  declarationType: string
  id: string
}) {
  const [isInitialMessage, setIsInitialMessage] = useState(true)
  const { state, dispatch } = useForm()
  const [sentence, setSentence] = useState("")
  const [_, setNewChatId] = useLocalStorage("newChatId", id)

  useEffect(() => {
    setNewChatId(id)
  })

  // Use useQuery for the initial message
  const { mutate: sendInitialMessage, isPending } = useMutation({
    mutationFn: ({
      nanoId,
      sentence,
      declarationType,
      isInitialMessage,
    }: {
      nanoId: string
      sentence: string
      declarationType: string
      isInitialMessage: boolean
    }) => taxAssistant(nanoId, sentence, declarationType, isInitialMessage),
    onMutate: async (variables) => {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          content: sentence,
          role: "USER", // Assuming the role is 'user' for the user message
          timestamp: new Date().toISOString(), // Current timestamp
        },
      })
    },
    onSuccess: (data) => {
      // add the user message to the state.messages array

      if (data.formData) {
        // push the data.message into the state.messages array
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            content: data.message,
            role: "BOT", // Assuming the role is 'assistant' for the response
            timestamp: new Date().toISOString(), // Current timestamp
          },
        })

        dispatch({
          type: "SET_RESPONSE_DATA",
          payload: { formData: data.formData },
        })

        setIsInitialMessage(false)
      }
      if (data.declarationType === "OTHER") {
        dispatch({ type: "SET_ERROR", payload: data.message })
      } else {
        dispatch({ type: "SET_ERROR", payload: data.message })
      }

      // toast.error("Nie udało się pobrać danych")
    },
    onError: (error) => {
      console.log(error)
      //   example error {
      //     "declarationType": "OTHER",
      //     "message": "Niestety, Twoja sprawa nie jest obecnie obsługiwana przez czat. Prosimy spróbować ponownie w przyszłości."
      // }
      dispatch({ type: "SET_ERROR", payload: error.message })
    },
    onSettled: () => {
      setSentence("")
    },
  })

  const { formRef, onKeyDown } = useEnterSubmit()

  const { messagesRef, scrollRef } = useScrollAnchor()

  return (
    <div className="relative z-[10] w-fit flex-shrink-0  basis-1/2">
      <div
        ref={scrollRef}
        className="reasonable:top-[96px] reasonable:h-[calc(100vh_-_96px)] pb-[200px] my-10 max-h-screen flex-shrink-0 overflow-x-hidden justify-self-end overflow-y-auto px-4 pt-6 md:sticky md:top-24 md:my-0 md:box-border "
      >
        {state.messages.length ? (
          <div
            ref={messagesRef}
            className="mx-auto overflow-auto h-[calc(80dvh_-_120.8px)]  max-w-2xl px-4"
          >
            {state.messages
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              )
              .map((message, index) => (
                <div key={message.timestamp}>
                  <div className="grid">
                    <div className="text-xs text-muted-foreground flex flex-row justify-between items-center">
                      <span>{message.role}</span>
                      <span>
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div>{message.content}</div>
                  </div>
                  {index < state.messages.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
          </div>
        ) : (
          <EmptyScreen />
        )}

        <div className="absolute bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80">
          <div className="mx-auto sm:max-w-2xl sm:px-4">
            <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault()
                  sendInitialMessage({
                    nanoId: id,
                    sentence,
                    declarationType,
                    isInitialMessage,
                  })
                }}
                className="flex flex-row space-x-2"
              >
                <Textarea
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 resize-none"
                  rows={1}
                />
                <Button type="submit" size="icon" disabled={isPending}>
                  <Wand2 className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
