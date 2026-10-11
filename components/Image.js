import NextImage from "next/image"

/**
 * next/image with a `title` taken from its alt text — imported everywhere
 * instead of next/image (`import Image from "@/components/Image"`). A
 * decorative image (alt="") gets no title, as it should not be announced.
 */
export default function Image({ title, alt, ...props }) {
  return <NextImage {...props} alt={alt} title={title ?? (alt || undefined)} />
}
