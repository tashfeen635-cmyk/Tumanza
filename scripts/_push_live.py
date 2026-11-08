"""One-shot: pull main, build, restart tumanza-user PM2. Credentials from env only."""
import os
import sys

import paramiko

HOST = os.environ.get('VPS_HOST')
USER = os.environ.get('VPS_USER', 'root')
PASSWORD = os.environ.get('VPS_PASSWORD')
if not HOST or not PASSWORD:
    print('Set VPS_HOST and VPS_PASSWORD', file=sys.stderr)
    sys.exit(1)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=60)


def run(cmd: str, timeout: int = 900) -> int:
    print(f'\n=== {cmd} ===', flush=True)
    _i, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode('utf-8', 'replace')
    err = stderr.read().decode('utf-8', 'replace')
    code = stdout.channel.recv_exit_status()
    print(out[-15000:] if len(out) > 15000 else out, flush=True)
    if err.strip():
        print('STDERR:', err[-2000:], flush=True)
    print('EXIT:', code, flush=True)
    return code


# Pull without git reset --hard; preserve .env and uploads
code = run(
    'cd /var/www/Tumanza && '
    'git fetch origin main && '
    'git pull origin main'
)
if code != 0:
    sys.exit(code)

code = run('cd /var/www/Tumanza && npm install', timeout=600)
if code != 0:
    sys.exit(code)

code = run('cd /var/www/Tumanza && rm -rf .next && npm run build', timeout=900)
if code != 0:
    sys.exit(code)

run('chown -R tumanza:tumanza /var/www/Tumanza/.next /var/www/Tumanza/ecosystem.config.cjs')
code = run(
    "su -s /bin/bash tumanza -c '"
    "cd /var/www/Tumanza && pm2 restart tumanza || pm2 start ecosystem.config.cjs"
    "'"
)
run("su -s /bin/bash tumanza -c 'pm2 save'")
run('sleep 4')
run("su -s /bin/bash tumanza -c 'pm2 list'")
run(
    "curl -s https://tumanza.com/about | grep -oE "
    "'How It All Began|himalayan-wellness-collection|introduced in 2026|showcase\\.png' | sort -u"
)
run(
    "curl -sI 'https://tumanza.com/images/himalayan-wellness-collection.png' | "
    "tr -d '\\r' | awk 'BEGIN{s=\"\";c=\"\"} /^HTTP/{s=$2} tolower($0)~/^content-type:/{c=$0} END{print s, c}'"
)

client.close()
sys.exit(0 if code == 0 else code)
