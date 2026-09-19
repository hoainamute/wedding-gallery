# Cloudflare backend: private photos + admin

## Create Cloudflare resources

1. Create a private R2 bucket named `nam-hang-wedding-photos`.
2. Create a D1 database named `nam-hang-wedding`; paste its id into `wrangler.toml`.
3. Run `wrangler d1 execute nam-hang-wedding --remote --file=./schema.sql` from this folder.
4. Set Worker secrets (never commit these):

```powershell
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

`ADMIN_TOKEN` should be a long random password. `SUPABASE_SERVICE_ROLE_KEY` is only used by the Worker to approve wishes; never use it in the public website.

5. Deploy: `npx wrangler deploy`.
6. Copy `cloudflare-config.example.js` to `cloudflare-config.js`, enter the deployed Worker URL, then deploy `admin.html`, `admin.js`, and `cloudflare-config.js` to GitHub Pages.

The Worker accepts guest image uploads at `/api/uploads`, keeps all R2 objects private, and serves only approved images through `/media/:id`.
