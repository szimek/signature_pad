import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    try {
      const parentURL = new URL(context.parentURL);
      let tsSpecifier = specifier;
      if (specifier.endsWith('.js')) {
        tsSpecifier = specifier.slice(0, -3) + '.ts';
      } else if (!specifier.endsWith('.ts')) {
        tsSpecifier = specifier + '.ts';
      }
      const resolvedTS = new URL(tsSpecifier, parentURL);
      if (fs.existsSync(fileURLToPath(resolvedTS))) {
        return nextResolve(tsSpecifier, context);
      }
    } catch {}
  }
  return nextResolve(specifier, context);
}
