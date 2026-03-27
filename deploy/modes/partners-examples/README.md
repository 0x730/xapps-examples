# Partners Examples Mode

This is the broader public example/reference lane.

Use it for:

- `xplace-example`
- `xconect`
- `xconect-host`
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
./deploy/modes/partners-examples/scripts/xop-partners-examples-verify.sh
./deploy/modes/partners-examples/scripts/xop-partners-examples-status.sh
```

Practical rule:

- this folder is the public reference lane only
- keep the `xconect` example runtime wired to the gateway tenant/profile `xconecta`
- keep example public domains here rather than reusing production hostnames

## What To Edit

Before first deploy:

- copy `env/xop-partners-examples.env.example` to `env/xop-partners-examples.env`
- replace all sample keys/secrets
- replace the PostgreSQL hostname in `XPLACE_EXAMPLE_DATABASE_URL` if needed
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
