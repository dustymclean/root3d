# Root3D Discord server

The Root3D Consulting Discord is generated from the same data as r3dconsulting.com: Knowledge Base,
service areas, FAQ, team bios, pricing, policies, SOP templates, regulators, the plant troubleshooter,
calculators, and case studies. The website stays the source of truth. Update it there, then rebuild.

## Files
- `generate.ts` turns the site's data into `server.json` (roles, channels, permissions, every post).
- `server.json` is the generated layout. Commit it after regenerating.
- `build.mjs` creates or updates the server through the Discord API. Node 18+, no dependencies.

## One-time setup
1. Add the bot to the server (Administrator permission):
   https://discord.com/oauth2/authorize?client_id=1562847426824511511&permissions=8&scope=bot&guild_id=1562847014440534149&disable_guild_select=true
2. In the Developer Portal, set **Installation → Install Link** to **None**, then turn off **Bot → Public Bot**.

## Build or update
```bash
npm run discord:generate                      # only after changing site content
DISCORD_TOKEN=<bot token> node discord/build.mjs
```
Never commit the token or paste it in chat. Running the build again is safe: it reuses existing
roles and channels, only fills empty channels, and only adds forum posts whose titles are missing.
To refresh a post whose text changed, delete it in Discord and run the build again.

## Roles
| Role | Who | Sees |
| --- | --- | --- |
| Root3D Partner | Dusty, Danny, Joel, Hunter | Everything; server admins |
| Client | Active consulting clients | Public, Insider, and Client channels |
| Insider | Paid subscribers | Public and Insider channels |
| (everyone) | Anyone who joins | Start Here, About, Knowledge Base, Tools, Community, call rooms |

Partners assign Client and Insider by hand after payment on the website. Discord's own Server
Subscriptions are unlikely to be approved for cannabis-related content, so they are not used.
