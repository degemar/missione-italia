import { describe, expect, it } from 'vitest';
import {spanish} from '../../src/i18n/locales/es.js';
import {translate, uiStringKeys} from '../../src/i18n/strings.js';
import type {UiStringKey} from '../../src/i18n/strings.js';

const placeholders = (value: string) => [...value.matchAll(/\{([a-zA-Z0-9]+)\}/g)].map((match) => match[1]).sort();
const typedUiStringKeys = uiStringKeys as readonly UiStringKey[];

describe('Spanish UI locale', () => {
  it('covers every UI key without extras', () => {
    expect(Object.keys(spanish).sort()).toEqual([...uiStringKeys].sort());
  });

  it.each(typedUiStringKeys.map((key) => [key] as const))('preserves placeholders for %s', (key) => {
    expect(placeholders(spanish[key])).toEqual(placeholders(translate(key)));
  });
});
