import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseWaTemplateSelectKey,
  sortWaCatalogItems,
  storedTemplateOutsideCatalog,
  waTemplateSelectKey,
  waTemplateSelectValueForForm,
} from '@/lib/waTemplateSelect'

test('waTemplateSelectKey round-trips name and language', () => {
  const key = waTemplateSelectKey('ballo_temp', 'en_GB')
  assert.deepEqual(parseWaTemplateSelectKey(key), { name: 'ballo_temp', language: 'en_GB' })
})

test('parseWaTemplateSelectKey returns null for empty or malformed keys', () => {
  assert.equal(parseWaTemplateSelectKey(''), null)
  assert.equal(parseWaTemplateSelectKey('no-separator'), null)
})

test('sortWaCatalogItems sorts by name then language', () => {
  const sorted = sortWaCatalogItems([
    { name: 'b', language: 'en' },
    { name: 'a', language: 'fr' },
    { name: 'a', language: 'en' },
  ])
  assert.deepEqual(
    sorted.map((x) => `${x.name}:${x.language}`),
    ['a:en', 'a:fr', 'b:en'],
  )
})

test('waTemplateSelectValueForForm returns key only when pair exists in catalog', () => {
  const catalog = [{ name: 't1', language: 'en_US' }]
  assert.equal(waTemplateSelectValueForForm('t1', 'en_US', catalog), waTemplateSelectKey('t1', 'en_US'))
  assert.equal(waTemplateSelectValueForForm('t1', 'en_GB', catalog), '')
  assert.equal(waTemplateSelectValueForForm('', 'en_US', catalog), '')
})

test('storedTemplateOutsideCatalog reports when saved pair is not in catalog', () => {
  const catalog = [{ name: 't1', language: 'en_US' }]
  assert.equal(storedTemplateOutsideCatalog('t1', 'en_US', catalog), null)
  assert.deepEqual(storedTemplateOutsideCatalog('legacy', 'en_GB', catalog), {
    name: 'legacy',
    language: 'en_GB',
  })
})
