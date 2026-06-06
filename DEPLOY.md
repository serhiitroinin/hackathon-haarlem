# Deploy runbook (Fly.io)

Everything is pre-wired. From a clean checkout, a live deploy is ~5 commands.
You're already logged in as `sergey4troinin@gmail.com` (`fly auth whoami`).

## TL;DR — first deploy

```bash
# 1. Create the app from the existing fly.toml (don't let it generate a new one)
fly launch --no-deploy --copy-config --name hackathon-haarlem --region ams

# 2. Provision Postgres and attach it (sets DATABASE_URL as a secret on the app)
fly postgres create --name hackathon-haarlem-db --region ams \
  --vm-size shared-cpu-1x --volume-size 1 --initial-cluster-size 1
fly postgres attach hackathon-haarlem-db --app hackathon-haarlem

# 3. Set the AI key (and OpenAI's, if you use it)
fly secrets set ANTHROPIC_API_KEY=sk-ant-... --app hackathon-haarlem

# 4. Ship it. The release_command runs `prisma db push` to create the schema.
fly deploy

# 5. Open it
fly open
```

## Redeploys

```bash
fly deploy            # rebuild + release (re-runs db push automatically)
fly logs             # tail logs
fly status           # machines / health
fly ssh console      # shell into the running machine
```

## How the pieces fit

| Concern | Where it's handled |
|---|---|
| Build | `Dockerfile` — multi-stage, pnpm via corepack, Prisma on debian-slim |
| Schema sync | `fly.toml` → `release_command = "pnpm db:push"` (runs each release) |
| `DATABASE_URL` | injected by `fly postgres attach` — never commit it |
| `ANTHROPIC_API_KEY` | `fly secrets set` (encrypted, not in `fly.toml`) |
| Model choice | `fly.toml [env]` (`AI_PROVIDER` / `AI_MODEL`), non-secret |
| Build-time env | `SKIP_ENV_VALIDATION=1` in the Dockerfile; real validation at boot |

## Notes & gotchas

- **App name is global.** If `hackathon-haarlem` is taken, pick another in step 1
  and update `app =` in `fly.toml`. `fly postgres attach` rewrites the secret to
  match whatever app name you used.
- **Schema changes:** `db push` is additive-safe but will drop columns you remove.
  Fine for the hackathon. For real migrations, generate them with
  `pnpm db:generate` and switch the release_command to `pnpm db:migrate`.
- **Scale to zero** is on (`min_machines_running = 0`) to save money; first hit
  after idle has a ~2s cold start. Set it to `1` in `fly.toml` for an always-warm demo.
- **Memory:** 1 GB VM. If the chat route OOMs under load, bump `[[vm]] memory`.
- **Postgres cost:** the smallest Fly Postgres (shared-cpu-1x, 1 GB volume) is
  cheap but not free. `fly postgres list` / `fly apps destroy <db>` to tear down.

## Local dev (now Postgres too)

```bash
docker compose up -d   # start local Postgres (matches .env DATABASE_URL)
pnpm db:push           # create the schema
pnpm dev               # http://localhost:3000
```

## Teardown

```bash
fly apps destroy hackathon-haarlem
fly apps destroy hackathon-haarlem-db
```
