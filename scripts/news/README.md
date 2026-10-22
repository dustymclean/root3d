# Industry Watch (daily news feed)

`.github/workflows/news.yml` runs `update.mjs` every morning (and on demand from the Actions tab). It:

1. Pulls official sources listed in `sources.json`: Federal Register searches (cannabis, marijuana, THC, CBD, hemp, EPA pesticide tolerances, APHIS plant pests, mycotoxins) and agency RSS feeds filtered by keyword.
2. Keeps each item's own title, date, summary, and link. Nothing is rewritten or generated, so what we publish matches the source.
3. Writes `public/news/feed.json` and `public/news/rss.xml`, commits them, and redeploys the site. They are shown at r3dconsulting.com/news.
4. Posts each new item to Discord if the repository secret `DISCORD_NEWS_WEBHOOK` is set (Discord → #regulatory-watch → Edit channel → Integrations → Webhooks → New webhook → Copy URL).

To add a source, such as a state regulator's RSS feed, add an entry to `rss` with `name`, `url`, `category`, and an optional `match` regex. A source that fails is logged and skipped. Check the run log in Actions after adding one.

Test without writing anything: `DRY_RUN=1 node scripts/news/update.mjs`.
