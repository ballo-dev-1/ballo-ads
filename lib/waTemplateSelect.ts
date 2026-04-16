const WA_TEMPLATE_SELECT_SEP = '\u0001'

export function waTemplateSelectKey(name: string, language: string): string {
  return `${name}${WA_TEMPLATE_SELECT_SEP}${language}`
}

export function parseWaTemplateSelectKey(key: string): { name: string; language: string } | null {
  if (!key) return null
  const i = key.indexOf(WA_TEMPLATE_SELECT_SEP)
  if (i < 0) return null
  return { name: key.slice(0, i), language: key.slice(i + WA_TEMPLATE_SELECT_SEP.length) }
}

export type WaTemplateCatalogEntry = { name: string; language: string }

export function sortWaCatalogItems<T extends WaTemplateCatalogEntry>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const byName = a.name.localeCompare(b.name)
    if (byName !== 0) return byName
    return a.language.localeCompare(b.language)
  })
}

export function waTemplateSelectValueForForm(
  name: string,
  language: string,
  catalog: WaTemplateCatalogEntry[],
): string {
  const n = name.trim()
  const l = language.trim()
  if (!n || !l) return ''
  const hit = catalog.some((t) => t.name === n && t.language === l)
  return hit ? waTemplateSelectKey(n, l) : ''
}

export function storedTemplateOutsideCatalog(
  name: string,
  language: string,
  catalog: WaTemplateCatalogEntry[],
): { name: string; language: string } | null {
  const n = name.trim()
  const l = language.trim()
  if (!n || !l) return null
  const hit = catalog.some((t) => t.name === n && t.language === l)
  return hit ? null : { name: n, language: l }
}
