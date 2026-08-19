import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { SITE_URL } from '../../src/site';

/**
 * netlify.toml is the only place the deployed site's redirects are declared,
 * and nothing else in the suite can reach them: the Playwright run serves
 * dist/ with scripts/serve-dist.mjs, which implements Netlify's file
 * resolution but not its redirect engine.
 *
 * So this asserts the rules themselves. The failure it exists to prevent is
 * specific: a forced redirect whose source host is the canonical host sends
 * every page to itself and takes the whole site down with a redirect loop.
 * That mistake is one typo away from the rule below it, and it would only
 * show up in production.
 */
const toml = fs.readFileSync(path.join(process.cwd(), 'netlify.toml'), 'utf8');

const rules = toml
  .split('[[redirects]]')
  .slice(1)
  .map((block) => {
    // Stop at the next top-level table so a later section is not read as
    // part of this rule.
    const body = block.split(/\r?\n\[/)[0];
    const field = (name: string) => {
      const line = body
        .split(/\r?\n/)
        .map((raw) => raw.trim())
        .find((raw) => raw.startsWith(`${name} `) || raw.startsWith(`${name}=`));
      if (!line) return '';
      return line
        .slice(line.indexOf('=') + 1)
        .trim()
        .replace(/^"|"$/g, '');
    };
    return {
      from: field('from'),
      to: field('to'),
      status: field('status'),
      force: field('force') === 'true',
    };
  });

/** Host of a redirect pattern, or '' for a path-only rule such as /old/*. */
const hostOf = (pattern: string) => {
  try {
    return new URL(pattern.replace(/\/\*$/, '/')).host;
  } catch {
    return '';
  }
};

const canonicalHost = new URL(SITE_URL).host;

test.describe('Netlify redirect rules', () => {
  test('the file declares rules at all', () => {
    // Guards the parser as much as the config: a silent parse failure would
    // make every other assertion here vacuously true.
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.from, 'every rule has a from').not.toBe('');
      expect(rule.to, `every rule has a to (${rule.from})`).not.toBe('');
    }
  });

  test('no forced rule redirects the canonical host to itself', () => {
    for (const rule of rules) {
      // A rule with no host is path-only and cannot loop a whole host.
      if (!hostOf(rule.from) || !rule.force) continue;

      expect(
        hostOf(rule.from),
        `forced redirect from ${rule.from} would loop the canonical host`,
      ).not.toBe(canonicalHost);
    }
  });

  test('the netlify.app duplicate is 301ed to the canonical host', () => {
    const duplicates = rules.filter(
      (rule) => hostOf(rule.from) === 'gotoburg.netlify.app',
    );

    // Both schemes, so a plain http:// link does not land on the duplicate.
    const schemes = duplicates
      .map((rule) => new URL(rule.from.replace(/\/\*$/, '/')).protocol)
      .sort();
    expect(schemes).toEqual(['http:', 'https:']);

    for (const rule of duplicates) {
      expect(rule.status, `status of ${rule.from}`).toBe('301');
      // Without force the rule never fires: after prerendering every path
      // resolves to a real file, and unforced rules are only the fallback.
      expect(rule.force, `force on ${rule.from}`).toBe(true);
      expect(hostOf(rule.to), `target of ${rule.from}`).toBe(canonicalHost);
      // :splat, not a bare host, or every page collapses onto the home page.
      expect(rule.to, `path preserved by ${rule.from}`).toContain(':splat');
    }
  });
});
