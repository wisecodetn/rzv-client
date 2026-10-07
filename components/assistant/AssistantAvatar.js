import "./assistant-avatar.css"

/**
 * The assistant's face (a face and a blinking-eyes layer). Its own module so
 * the /assistant page can show it without importing the whole chat bubble —
 * which the layout already loads lazily: the page used to ship it twice.
 */
export default function AssistantAvatar({ size = 56, big = false }) {
  const n = big || size > 64 ? 320 : 192
  return (
    <span className="rzv-assist-face" style={{ width: size, height: size }} aria-hidden="true">
      {/* Two tiny pre-sized sprites stacked for the CSS blink — next/image's
          wrapper and srcset would add weight for nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assistant/face-${n}.webp`} alt="" width={size} height={size} draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="rzv-assist-eyes" src={`/assistant/eyes-${n}.webp`} alt="" width={size} height={size} draggable={false} />
    </span>
  )
}
