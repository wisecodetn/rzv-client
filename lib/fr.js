/**
 * "de coiffure" / "d'onglerie" / "d'esthétique" — French elides "de" before a
 * vowel. Not before "h": the category names start with an aspirated h
 * ("de hammam"), where elision would be wrong.
 */
export const de = (word) => (/^[aeiouyàâäéèêëîïôöùûü]/i.test(String(word || "")) ? `d'${word}` : `de ${word}`)
