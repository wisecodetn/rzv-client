"use client"

/** Opens the chat bubble from anywhere on the page — and, given a question,
 *  asks it straight away (see AssistantBubble → "rzv:assistant"). */
export default function AskAssistant({ question = null, className = "", children }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("rzv:assistant", { detail: { question } }))}
    >
      {children}
    </button>
  )
}
