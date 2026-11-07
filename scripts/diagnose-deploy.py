"""Read-only VPS diagnosis for unstyled / asset-mismatch issues.

Credentials (required):
  VPS_HOST / DEPLOY_HOST
  VPS_USER / DEPLOY_USER  (default: root)
  VPS_PASSWORD / DEPLOY_PASS
  Optional: VPS_PORT (default: 22)

This script does NOT mutate the server (no git reset, build, or pm2 restart).
"""
import os
import sys

import paramiko

HOST = os.environ.get('VPS_HOST') or os.environ.get('DEPLOY_HOST')
USER = os.environ.get('VPS_USER') or os.environ.get('DEPLOY_USER') or 'root'
PASSWORD = os.environ.get('VPS_PASSWORD') or os.environ.get('DEPLOY_PASS')
PORT = int(os.environ.get('VPS_PORT', '22'))
REMOTE_APP = '/var/www/Tumanza'

if not HOST:
    print('ERROR: Set VPS_HOST or DEPLOY_HOST', file=sys.stderr)
    sys.exit(1)

DIAG_COMMANDS = [
    'ss -ltnp | grep 3000 || true',
    'echo "=== root pm2 ==="; pm2 list || true',
    'echo "=== tumanza user pm2 ==="; su -s /bin/bash tumanza -c "pm2 list; pm2 info tumanza" || true',
    'su -s /bin/bash tumanza -c "pm2 logs tumanza --lines 50 --nostream" || true',
    'systemctl is-active pm2-tumanza.service || true',
    f'cd {REMOTE_APP} && git log -1 --oneline && git status -sb && git rev-parse HEAD && git rev-parse origin/main 2>/dev/null || true',
    'nginx -T 2>/dev/null | grep -n -i "tumanza\\|_next\\|root\\|alias\\|proxy_pass\\|proxy_cache" || true',
    f'ls -la {REMOTE_APP}/.next/static/chunks 2>/dev/null | head -n 20 || echo "NO .next/static/chunks"',
    'curl -sI https://tumanza.com | head -n 20',
    "curl -s https://tumanza.com | grep -oE '/_next/static/[^\"]+' | sort -u",
    "curl -s https://tumanza.com | grep -oE '/img/[^\" ]+' | sort -u",
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f'Connecting to {HOST}...')
    connect_kwargs = {
        'hostname': HOST,
        'port': PORT,
        'username': USER,
        'timeout': 30,
        'allow_agent': True,
        'look_for_keys': True,
    }
    if PASSWORD:
        connect_kwargs['password'] = PASSWORD
    client.connect(**connect_kwargs)

    def run_cmd(cmd: str) -> str:
        print(f'\n--- RUNNING: {cmd} ---')
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            sys.stdout.buffer.write(out.encode('utf-8', errors='ignore'))
            sys.stdout.flush()
        if err:
            sys.stdout.buffer.write(f'STDERR: {err}\n'.encode('utf-8', errors='ignore'))
            sys.stdout.flush()
        return out

    for cmd in DIAG_COMMANDS:
        run_cmd(cmd)

    assets = run_cmd("curl -s https://tumanza.com | grep -oE '/_next/static/[^\"]+' | sort -u")
    for path in [p.strip() for p in assets.splitlines() if p.strip()]:
        run_cmd(f'curl -sI "https://tumanza.com{path}" | head -n 15')

except Exception as e:
    print('Diagnosis error:', e)
    sys.exit(1)
finally:
    client.close()
