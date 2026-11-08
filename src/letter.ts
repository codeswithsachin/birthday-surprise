import { content, fill } from './content';

/* Builds the final letter text from content.ts. Personal and romantic
   paragraphs are only included when the creator wrote them. */
export function letterParagraphs(): string[] {
  const l = content.letter;
  const base = [...l.paragraphs];
  const last = base.pop();
  const extra: string[] = [];
  if (l.personalParagraph.trim()) extra.push(l.personalParagraph.trim());
  const warm = content.relationship === 'partner' || content.relationship === 'crush';
  if (warm && l.romanticParagraph.trim()) extra.push(l.romanticParagraph.trim());
  return [...base, ...extra, ...(last ? [last] : [])].map(fill);
}

export function letterPlainText(): string {
  const l = content.letter;
  const lines = [
    fill(l.greeting),
    '',
    ...letterParagraphs().flatMap((p) => [p, '']),
    ...l.closing.flatMap((c) => [fill(c), '']),
    fill(l.signOff),
    fill(l.signature),
    '',
  ];
  return lines.join('\n');
}
