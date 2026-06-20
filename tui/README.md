# typerace.io

A minimal [OpenTUI](https://github.com/anomalyco/opentui) application served directly over SSH. Each connection gets an independent counter centered in its terminal.

## Run locally

Requires Bun 1.3 or newer.

```sh
bun install
bun run dev
```

Connect from another terminal:

```sh
ssh -p 2222 localhost
```

Every keypress increments the counter. Press Ctrl-C to disconnect.

## Deploy with systemd

Install Bun 1.3 or newer on the server, copy this directory to the server, then install production dependencies:

```sh
bun install --frozen-lockfile --production
```

Create `/etc/systemd/system/typerace-tui.service` (adjust `User`, `WorkingDirectory`, and the Bun path):

```ini
[Unit]
Description=typerace.io OpenTUI SSH server
After=network.target

[Service]
Type=simple
User=typerace
WorkingDirectory=/srv/typerace.io/tui
ExecStart=/home/typerace/.bun/bin/bun run start
Environment=NODE_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT=2222
Environment=SSH_HOST_KEY_PATH=/var/lib/typerace-tui/ssh_host_ed25519_key
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Create the state directory and start the service:

```sh
sudo install -d -o typerace -g typerace /var/lib/typerace-tui
sudo systemctl daemon-reload
sudo systemctl enable --now typerace-tui
```

The persistent host key prevents changed-host-key warnings after a restart or redeploy.

The service is intentionally open: anyone who can reach its SSH port can start a session. The startup warning about missing authentication is therefore expected.

Connect to a deployed host with:

```sh
ssh -p 2222 your-host.example
```

`PORT`, `HOST`, `IDLE_TIMEOUT`, and `MAX_TIMEOUT` can be set in the service environment.
