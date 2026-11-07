"""Deploy Tumanza to the VPS via SSH.

Credentials (required):
  VPS_HOST / DEPLOY_HOST
  VPS_USER / DEPLOY_USER  (default: root)
  VPS_PASSWORD / DEPLOY_PASS
  Optional: VPS_PORT (default: 22)

Prefer SSH keys; password auth is only used when VPS_PASSWORD/DEPLOY_PASS is set.
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
if not PASSWORD and not (os.environ.get('SSH_AUTH_SOCK') or os.path.exists(os.path.expanduser('~/.ssh/id_rsa'))):
    print('ERROR: Set VPS_PASSWORD or DEPLOY_PASS, or configure SSH key auth', file=sys.stderr)
    sys.exit(1)

# App is managed by the tumanza user's PM2 (systemd: pm2-tumanza.service).
# Do not start a second copy under root's PM2 — that causes port 3000 conflicts.
commands = [
    f'cd {REMOTE_APP}',
    'git stash',
    'git pull origin main',
    'npm install',
    'npm run build',
    "su -s /bin/bash tumanza -c 'cd /var/www/Tumanza && pm2 restart tumanza || pm2 start ecosystem.config.cjs'",
    "su -s /bin/bash tumanza -c 'pm2 save'",
]

print(f'Connecting to {HOST}...')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    connect_kwargs = {
        'hostname': HOST,
        'port': PORT,
        'username': USER,
        'timeout': 60,
        'allow_agent': True,
        'look_for_keys': True,
    }
    if PASSWORD:
        connect_kwargs['password'] = PASSWORD
    client.connect(**connect_kwargs)
    print('Connected successfully!')

    full_command = ' && '.join(commands)
    print(f'Executing: {full_command}')

    stdin, stdout, stderr = client.exec_command(full_command, get_pty=True)

    while True:
        line = stdout.readline()
        if not line:
            break
        sys.stdout.buffer.write(line.encode('utf-8', errors='ignore'))
        sys.stdout.flush()

    err = stderr.read().decode('utf-8', errors='ignore')
    if err:
        print('STDERR:', err)

    print('Deployment script finished successfully.')
except Exception as e:
    print(f'Deployment failed: {e}')
    sys.exit(1)
finally:
    client.close()
