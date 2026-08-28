# SiteScoper logo brief & implementation plan

## Direction I’m choosing for you

- **Style:** Minimal icon + wordmark. A precise, confident mark (not literal clip-art) that reads as “inspection / focus / site review.” Think editorial-tech: simple strokes, no gradients, no shadows, no glow.
- **Name in logo:** Icon + wordmark together, plus a standalone icon version for favicon / avatar / small spaces.
- **Palette:** Match the site redesign — warm paper `#f5f3ee`, ink `#0d0d0d`, clay accent `#c65a3e`. Logo must work in single-color ink on paper and reversed (white on dark).
- **Typography:** Pair with the site’s new editorial type: heading font is *Instrument Serif*, body is *Work Sans*. The logo wordmark can either use *Instrument Serif* (elegant, same as site) or a custom-drawn wordmark if the designer proposes one.

## Copy-paste brief for the designer

> **Project:** Logo for SiteScoper — an AI website UX auditor and SEO checker.
>
> **What we need:**
> - Primary logo: icon + wordmark (“SiteScoper”)
> - Standalone icon version
> - Favicon and app-avatar version
>
> **Brand feel:** Editorial, precise, human. Not “AI startup generic.” Avoid gradients, glows, purple/blue tech palettes, pill shapes, and meaningless geometric flourishes. The design should feel like something a craft-led product studio would ship.
>
> **Suggested concept (open to refinement):** A magnifying scope / lens / crosshair mark that implies focused inspection of a website. Avoid a literal magnifying glass if it looks clip-arty. We prefer a simplified, geometric abstraction.
>
> **Color palette:**
> - Paper background: `#f5f3ee`
> - Ink / primary: `#0d0d0d`
> - Clay accent: `#c65a3e`
> Logo must work as a single-color mark in ink on paper and reversed on dark.
>
> **Typography:** Use or complement *Instrument Serif* and *Work Sans* if you are including the wordmark in type. The wordmark should feel editorial, not sporty or corporate.
>
> **Deliverables:**
> 1. SVG source file(s)
> 2. PNG exports at 32, 64, 128, 256, 512 px for the mark
> 3. Favicon `.ico` and `.svg`
> 4. One-page usage guide (clear space, minimum size, color versions, what not to do)
>
> **What to avoid:**
> - Gradients, shadows, glows, 3D effects
> - Overly literal robot / AI / rocket / lightning imagery
> - Thin details that disappear at favicon size
> - Multiple colors required for the logo to be readable
>
> **References we like:** Linear, Notion, Figma, Pitch — simple geometric marks, confident wordmarks, calm color discipline.

## Files you should upload when the designer sends them back

Upload these and I’ll swap them into the app:
1. `logo-primary.svg` — main icon + wordmark (for the header)
2. `logo-mark.svg` — standalone icon (for favicon, avatar, small spaces)
3. `logo-mark.png` — raster fallback at least 256×256 px
4. `brand-guide.pdf` or `.png` — usage guide (optional but helpful)

## Implementation plan once files are ready

1. Upload the new logo assets to `src/assets/` as Lovable Assets.
2. Replace `src/assets/logo-mark.png` and update `public/favicon.svg`.
3. Update `src/components/AppHeader.tsx` to use the new primary logo mark/wordmark.
4. Update `src/components/SiteFooter.tsx`, `src/pages/SharedAnalysis.tsx`, and any other places the old logo appears.
5. Update `public/site.webmanifest` if the icon name/shape changes.
6. Run typecheck + build, then verify the header, favicon, and shared-report header in the preview.
7. Add a changelog entry for the new logo in `src/data/changelog.ts` and all five locale files.
