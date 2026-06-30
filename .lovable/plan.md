# Daily YouTube Short generator — admin-only, manual posting

A new ready-to-post Short shows up at `/admin/youtube` every morning. You copy the text, download the MP4, post it yourself.

## `/admin/youtube` page

**Today's Short** (top card)
- 9:16 inline video preview
- **Title** (≤60 chars) + copy button
- **Description** (with UTM-tagged sitescoper.com link) + copy button
- **Tags** (comma-separated) + copy button
- Format used (one of the 5 in the youtube-shorts-growth skill) and the concrete insight
- **Download MP4** button
- **Regenerate** button (in case you hate it)

**History** (below)
- Past Shorts with thumbnail, date, title, status (`generated` / `posted` / `skipped`)
- **Mark as posted** toggle so you can track what went live (later this powers a "signups per Short" view once you start tagging UTMs)

Page is gated by `has_role(auth.uid(), 'admin')`.

## Backend

1. **Table `youtube_shorts`** — `id, generated_at, format, insight, title, description, tags text[], video_path, status ('generated'|'posted'|'skipped'), posted_at, utm_campaign`
2. **Storage bucket `youtube-shorts`** (private) — MP4s; admin gets signed URLs
3. **Edge function `youtube-short-generate`**
   - Rotates through the 5 formats from the skill (`references/short-formats.md`)
   - Picks a real insight (random recent `analysis_history` finding or a SiteScoper hook)
   - Lovable AI (Gemini) drafts script + on-screen captions + title + description + tags
   - Renders 1080x1920 MP4 via Remotion (new composition `short` reusing existing `remotion/` setup)
   - Uploads to the bucket, inserts the row
4. **pg_cron** daily at 13:00 UTC → calls `youtube-short-generate`
5. **Edge function `youtube-short-regenerate`** — manual trigger from the page

## What you do

Just say **build it** and once it's done:
1. Open `/admin/youtube` each morning
2. Copy title / description / tags
3. Click **Download MP4**
4. Upload to YouTube Shorts manually
5. Click **Mark as posted**

Used the youtube-shorts-growth skill.
