import Image from "next/image"
import Photo from "@/components/Photo"
import { catLabel } from "@/lib/blog"

/**
 * An article's cover. Falls back to the generated placeholder for posts that
 * have none, so a missing image never collapses a card's layout.
 */
export default function PostCover({ post, sizes = "100vw", eager = false }) {
  if (!post?.cover) return <Photo label={`${catLabel(post)} — ${post?.title ?? ""}`} />
  return (
    <Image
      src={post.cover}
      alt={post.title}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      style={{ objectFit: "cover" }}
    />
  )
}
