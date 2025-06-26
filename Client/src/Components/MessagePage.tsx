

import { useRef } from 'react'
import {useMutation} from "@tanstack/react-query"

export default function MessagePage() {

  const createChannel = useMutation({mutationFn: ()=> Promise.resolve})

  const nameRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <h1>Conversation entre x et y</h1>


    </div>
  )
}