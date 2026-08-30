/** Styled placeholder standing in for the design's fillable image-slot. Real
 *  salon photos drop in here later; accessible via role/aria-label meanwhile. */
export default function Photo({ label, style, className = "", children }) {
  return (
    <div className={`photo ${className}`} role="img" aria-label={label || "Rezervy"} title={label || "Rezervy"} style={style}>
      {children}
    </div>
  )
}
