# Partners Examples Mode

This is the broader public example/reference lane.

Use it for:

- `xplace-example`
- `xconecta`
- `xconecta-host`
- `xconectb`
- `xconectb-host`
- `xconectc`
- `xconectc-host`

This folder is intended to be public and self-contained. It keeps its own:

- docker compose surface
- env template
- Nginx vhost templates
- operator scripts

The scripts in `scripts/` are self-contained and do not depend on the private
production `partners` folder.

## Quick Start

```bash
cp deploy/modes/partners-examples/env/xop-partners-examples.env.example \
  deploy/modes/partners-examples/env/xop-partners-examples.env

./deploy/modes/partners-examples/scripts/xop-partners-examples-start.sh
./deploy/modes/partners-examples/scripts/xop-partners-examples-publish.sh
./deploy/modes/partners-examples/scripts/xop-partners-examples-verify.sh
./deploy/modes/partners-examples/scripts/xop-partners-examples-status.sh
```

Lane ownership split:

- `xop-partners-examples-start.sh` starts the examples runtime
- `xop-partners-examples-publish.sh` publishes the examples tenant guard sets and `xplace-example` xapps into the gateway
- unified/core can now use [../unified/scripts/xop-provision-foundation.sh](../unified/scripts/xop-provision-foundation.sh) when you want tenant/publisher bootstrap without the examples publish wave

Clean recreate of the external `xplace_example` PostgreSQL DB on startup:

```bash
XPLACE_EXAMPLE_RECREATE_DB_ON_STARTUP=1 ./deploy/modes/partners-examples/scripts/xop-partners-examples-start.sh
```

Practical rule:

- this folder is the public reference lane only
- keep the `xconecta` example runtime and host separate from the production `xconect` lane
- keep example public domains here rather than reusing production hostnames

## What To Edit

Before first deploy:

- copy `env/xop-partners-examples.env.example` to `env/xop-partners-examples.env`
- replace all sample keys/secrets
- replace the PostgreSQL hostname in `XPLACE_EXAMPLE_DATABASE_URL` if needed
- set the `XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY` default and any needed
  `XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY_SLUG_MAP` / `XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY_MAP`
- set `XPLACE_EXAMPLE_PORTAL_BASE_URL` and `XPLACE_EXAMPLE_PUBLISHER_BASE_URL`
- choose the public example hostnames you actually want to serve

Then:

- install the matching Nginx vhosts from `nginx/`
- run `scripts/xop-partners-examples-preflight.sh`
- run `scripts/xop-partners-examples-start.sh`
- run `scripts/xop-partners-examples-verify.sh`
- use `scripts/xop-partners-examples-reset.sh` only when you intentionally want
  to remove containers and volumes for this lane

## Nginx Templates

- [xconecta-example.0x730.com.conf](nginx/xconecta-example.0x730.com.conf)
- [xconecta-example-host.0x730.com.conf](nginx/xconecta-example-host.0x730.com.conf)
- [xconectb-example.0x730.com.conf](nginx/xconectb-example.0x730.com.conf)
- [xconectb-example-host.0x730.com.conf](nginx/xconectb-example-host.0x730.com.conf)
- [xconectc-example.0x730.com.conf](nginx/xconectc-example.0x730.com.conf)
- [xconectc-example-host.0x730.com.conf](nginx/xconectc-example-host.0x730.com.conf)
- [xplace-example.0x730.com.conf](nginx/xplace-example.0x730.com.conf)
