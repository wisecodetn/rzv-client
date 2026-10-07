import Link from "next/link"
import PageShell from "@/components/PageShell"
import JsonLd from "@/components/JsonLd"
import AssistantAvatar from "@/components/assistant/AssistantAvatar"
import AskAssistant from "@/components/assistant/AskAssistant"
import { getAssistantStatus } from "@/lib/assistant"
import { faqLd } from "@/lib/jsonld"
import { pageMeta } from "@/lib/meta"
import "./assistant-page.css"

export const metadata = pageMeta({
  title: "Assistant IA — votre assistant beauté",
  description: "L’assistant Rezervy répond à vos questions 24h/24 : trouver un salon, connaître les prix, les horaires et les créneaux libres. Ce qu’il sait faire, ses limites et vos données.",
  path: "/assistant",
})

/* Every claim on this page matches what the assistant actually does
   (server/src/assistant): read-only tools over the public salon data and the
   help centre, no booking, no account access, anonymous masked logs. Change
   the assistant, change this page. */

const CAN = [
  {
    t: "Trouver un salon",
    d: "Par ville, quartier, prestation ou type de salon. Il vous propose les salons publiés sur Rezervy qui correspondent le mieux.",
    i: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3",
  },
  {
    t: "Prix et prestations",
    d: "Il lit la carte du salon : prestations, durées, prix en dinars et forfaits du moment.",
    i: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z M7.5 7.5h.01",
  },
  {
    t: "Horaires et adresse",
    d: "Jours d’ouverture, horaires, adresse et téléphone du salon, tels qu’affichés sur sa page.",
    i: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  },
  {
    t: "Créneaux disponibles",
    d: "Il vérifie les créneaux réellement libres pour une prestation et une date, puis vous donne le lien de réservation avec la prestation déjà choisie.",
    i: "M4 5h16v16H4z M4 9.5h16 M8.5 3v4 M15.5 3v4 M9 15l2 2 4-4",
  },
  {
    t: "Questions sur Rezervy",
    d: "Réservation gratuite, paiement au salon, annulation, liste d’attente : il répond à partir de notre centre d’aide.",
    i: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6 M12 17h.01",
  },
  {
    t: "Dans votre langue",
    d: "Français, arabe, derja ou anglais : écrivez comme vous parlez, il vous répond dans la même langue.",
    i: "M4 5h7 M7.5 3v2 M5 11s2.5-1 4-6 M6 8c.5 2 2.5 3.5 4 4 M12 21l4.5-10L21 21 M13.5 18h6",
  },
]

const CANNOT = [
  {
    t: "Il ne réserve pas à votre place",
    d: "Il vous donne le lien : vous choisissez et confirmez vous-même votre créneau. Pour annuler ou déplacer un rendez-vous, c’est dans « Mes rendez-vous ».",
  },
  {
    t: "Il n’a pas accès à votre compte",
    d: "Il ne voit ni vos rendez-vous, ni vos favoris, ni vos informations personnelles.",
  },
  {
    t: "Il ne connaît que Rezervy",
    d: "Uniquement les salons publiés sur Rezervy et leurs informations publiques. Il ne cherche pas sur le reste d’internet.",
  },
  {
    t: "Il peut se tromper",
    d: "C’est une intelligence artificielle : elle peut mal comprendre une question. La page du salon et la page de réservation font toujours foi.",
  },
  {
    t: "Les créneaux bougent",
    d: "Un créneau libre au moment de la réponse peut être pris quelques minutes plus tard. Il n’est à vous qu’une fois la réservation confirmée.",
  },
  {
    t: "Ni santé, ni hors sujet",
    d: "Il reste sur la beauté et sur Rezervy. Pour une allergie ou un souci de santé, parlez-en au salon ou à un professionnel de santé.",
  },
]

const STEPS = [
  ["Vous posez votre question", "Dans la bulle, en bas à droite de chaque page — ou depuis les exemples ci-dessous."],
  ["Il consulte Rezervy en direct", "Salons, prestations, prix, horaires, créneaux libres et centre d’aide : il lit les mêmes données que le site."],
  ["Il répond avec des liens", "Vers la page du salon ou la réservation. Vous vérifiez, et vous réservez vous-même."],
]

const EXAMPLES = [
  "Je cherche un barbier ouvert le dimanche",
  "Combien coûte un brushing ?",
  "Il reste des créneaux demain matin pour une coupe ?",
  "La réservation est-elle payante ?",
  "Comment annuler mon rendez-vous ?",
  "Famma salon fih manucure ?",
]

const faqs = (days) => [
  ["L’assistant Rezervy est-il gratuit ?", "Oui. Il est gratuit et accessible sans compte, depuis la bulle en bas à droite de chaque page du site."],
  [
    "Puis-je réserver directement avec l’assistant ?",
    "Non. Il vous donne le lien de réservation avec la prestation déjà sélectionnée ; vous choisissez et confirmez vous-même votre créneau. La réservation est gratuite et la prestation se règle au salon.",
  ],
  [
    "Les informations données sont-elles fiables ?",
    "Il s’appuie en temps réel sur les informations publiées par les salons sur Rezervy. Mais c’est une intelligence artificielle : elle peut mal interpréter une question. La page du salon et la page de réservation font foi.",
  ],
  [
    "Que deviennent mes messages ?",
    `Ils sont transmis à Gemini, le modèle d’intelligence artificielle de Google, pour produire la réponse. Rezervy conserve les conversations ${days} jours, de façon anonyme, pour améliorer l’assistant ; les numéros de téléphone et adresses e-mail sont masqués avant tout enregistrement.`,
  ],
  [
    "L’assistant ne répond pas, que faire ?",
    "Réessayez dans quelques minutes : en cas de forte affluence, il peut être momentanément indisponible, et le nombre de messages est limité par heure. Le centre d’aide et la page Contact restent à votre disposition.",
  ],
  ["Comment signaler une mauvaise réponse ?", "Cliquez sur le pouce vers le bas sous la réponse. L’équipe Rezervy relit ces signalements pour corriger l’assistant."],
]

function Icon({ d, size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const H2 = ({ children, sub }) => (
  <div style={{ margin: "44px 0 16px" }}>
    <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, margin: 0 }}>
      {children}
    </h2>
    {sub && <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "6px 0 0", lineHeight: 1.6, maxWidth: 620 }}>{sub}</p>}
  </div>
)

export default async function AssistantPage() {
  const { enabled, retentionDays } = await getAssistantStatus()
  const FAQ = faqs(retentionDays)

  return (
    <PageShell
      title="L’assistant Rezervy"
      crumb="Assistant Rezervy"
      subtitle="Un assistant intelligent qui répond à vos questions sur les salons et sur Rezervy, à toute heure — et qui sait aussi dire ce qu’il ne sait pas."
    >
      <JsonLd data={faqLd(FAQ)} />

      {/* Hero */}
      <section className="ai-hero">
        <div className="ai-hero-face">
          <span className="ai-hero-ring" aria-hidden="true" />
          <span className="rzv-assist-bob">
            <AssistantAvatar size={150} big />
          </span>
        </div>
        <div className="ai-hero-text">
          <span className={`ai-status ${enabled ? "is-on" : ""}`}>{enabled ? "En ligne 24h/24" : "Momentanément indisponible"}</span>
          <h2 className="serif ai-hero-title">Posez votre question, il cherche pour vous.</h2>
          <p className="ai-hero-sub">
            Un barbier ouvert le dimanche ? Le prix d’un balayage ? Un créneau libre demain matin ? L’assistant consulte les salons
            publiés sur Rezervy et leurs disponibilités réelles, puis vous répond en quelques secondes, avec les liens pour réserver.
          </p>
          <div className="ai-hero-cta">
            {enabled ? (
              <AskAssistant className="btn-on-dark ai-btn">Discuter avec l’assistant</AskAssistant>
            ) : (
              <Link href="/centre-aide" className="btn-on-dark ai-btn">
                Voir le centre d’aide
              </Link>
            )}
            <span className="ai-hero-fine">Gratuit · sans inscription · en bas à droite de chaque page</span>
          </div>
        </div>
      </section>

      {/* Abilities */}
      <H2 sub="Il lit en direct les mêmes informations que le site : rien d’inventé, rien de mémorisé d’avance.">Ce qu’il sait faire</H2>
      <div className="ai-grid">
        {CAN.map((c) => (
          <div key={c.t} className="ai-card">
            <span className="ai-card-icon">
              <Icon d={c.i} />
            </span>
            <div className="ai-card-title">{c.t}</div>
            <div className="ai-card-text">{c.d}</div>
          </div>
        ))}
      </div>

      {/* Examples */}
      {enabled && (
        <>
          <H2 sub="Cliquez sur une question : l’assistant s’ouvre et vous répond.">Essayez par exemple</H2>
          <div className="ai-examples">
            {EXAMPLES.map((q) => (
              <AskAssistant key={q} question={q} className="ai-example">
                <span aria-hidden="true" className="ai-example-mark">
                  “
                </span>
                {q}
              </AskAssistant>
            ))}
          </div>
        </>
      )}

      {/* Limits */}
      <H2 sub="Un bon assistant connaît ses limites. Voici les siennes, sans détour.">Ce qu’il ne fait pas</H2>
      <div className="ai-limits">
        {CANNOT.map((c) => (
          <div key={c.t} className="ai-limit">
            <span className="ai-limit-icon" aria-hidden="true">
              <Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M5.6 5.6l12.8 12.8" size={17} />
            </span>
            <div>
              <div className="ai-card-title">{c.t}</div>
              <div className="ai-card-text">{c.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <H2>Comment ça marche</H2>
      <ol className="ai-steps">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="ai-step">
            <span className="ai-step-n">{i + 1}</span>
            <div className="ai-card-title">{t}</div>
            <div className="ai-card-text">{d}</div>
          </li>
        ))}
      </ol>

      {/* Data */}
      <H2>Vos données</H2>
      <div className="ai-data">
        <span className="ai-card-icon">
          <Icon d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z M9 12l2 2 4-4" />
        </span>
        <div className="ai-card-text" style={{ fontSize: 13.5 }}>
          <p style={{ margin: 0 }}>
            Les réponses sont générées par <b>Gemini</b>, le modèle d’intelligence artificielle de Google, à partir des données de
            Rezervy : vos messages lui sont transmis pour produire la réponse.
          </p>
          <p style={{ margin: "10px 0 0" }}>
            Nous conservons les conversations <b>{retentionDays} jours</b> après le dernier message, pour corriger les réponses
            inexactes et savoir quels salons et quelles villes vous recherchez. Elles sont <b>anonymes</b> — aucun lien avec votre
            compte ni votre adresse IP — et les numéros de téléphone et adresses e-mail sont <b>masqués</b> avant tout
            enregistrement. Ne partagez pas d’informations personnelles dans le chat.
          </p>
          <p style={{ margin: "10px 0 0" }}>
            Les pouces 👍 et 👎 sous chaque réponse nous aident à l’améliorer.{" "}
            <Link href="/confidentialite#assistant" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>

      {/* FAQ — plain <details>, readable without JavaScript and by crawlers. */}
      <H2>Questions fréquentes</H2>
      <div className="ai-faq">
        {FAQ.map(([q, a]) => (
          <details key={q} className="ai-faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>

      {/* Credit */}
      <section className="ai-credit">
        <div>
          <div className="ai-credit-kicker">Conçu et développé par</div>
          <div className="serif ai-credit-name">Wise Code</div>
          <p className="ai-credit-text">
            L’assistant Rezervy, comme l’ensemble de la plateforme — le site de réservation, l’espace professionnel des salons et le
            back-office — est conçu et développé par Wise Code.
          </p>
        </div>
        <a href="https://wisecode.tn" target="_blank" rel="noopener" className="btn-on-dark ai-btn">
          Découvrir Wise Code ↗
        </a>
      </section>
    </PageShell>
  )
}
