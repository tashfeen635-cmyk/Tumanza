import os
import sys
from pathlib import Path
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[1]
HOST = os.environ.get('VPS_HOST') or os.environ.get('DEPLOY_HOST')
USER = os.environ.get('VPS_USER') or os.environ.get('DEPLOY_USER') or 'root'
PASSWORD = os.environ.get('VPS_PASSWORD') or os.environ.get('DEPLOY_PASS')
REMOTE_APP = '/var/www/Tumanza'

def main() -> int:
    if not HOST:
        print('ERROR: Set VPS_HOST or DEPLOY_HOST', file=sys.stderr)
        return 1
    if not PASSWORD:
        print('ERROR: Set VPS_PASSWORD or DEPLOY_PASS', file=sys.stderr)
        return 1

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f'Connecting to {HOST} as {USER}...')
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30, allow_agent=False, look_for_keys=False)

    def run(cmd: str, timeout: int = 600, as_user: bool = False) -> int:
        if as_user:
            cmd = f'su -s /bin/bash tumanza -c "{cmd}"'
        print('>>', cmd)
        _i, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
        out = stdout.read().decode('utf-8', 'replace')
        err = stderr.read().decode('utf-8', 'replace')
        code = stdout.channel.recv_exit_status()
        if out:
            print(out[-3000:] if len(out) > 3000 else out)
        if err:
            print('ERR:', err[-1500:] if len(err) > 1500 else err)
        return code

    # 1. Backup public/uploads
    run('mkdir -p /tmp/tumanza_backup')
    run(f'cp -rf {REMOTE_APP}/public/uploads /tmp/tumanza_backup/uploads 2>/dev/null || true')

    # Fix git repo ownership and pull latest main (remove conflicting untracked files)
    run(f'chown -R root:root {REMOTE_APP}')
    run(f'cd {REMOTE_APP} && git reset --hard HEAD && rm -f public/uploads/.gitkeep && git clean -fd -e public/uploads -e .env')
    code = run(f'cd {REMOTE_APP} && git pull origin main')
    if code != 0:
        print('Git pull failed, trying force checkout...')
        run(f'cd {REMOTE_APP} && git fetch origin main && git reset --hard origin/main')

    # Upload local .env to remote server
    local_env_path = ROOT / '.env'
    if local_env_path.exists():
        print('Uploading local .env to remote server...')
        sftp = client.open_sftp()
        sftp.put(str(local_env_path), f'{REMOTE_APP}/.env')
        sftp.close()

    # Restore public/uploads
    run(f'mkdir -p {REMOTE_APP}/public')
    run(f'cp -rf /tmp/tumanza_backup/uploads {REMOTE_APP}/public/uploads 2>/dev/null || true')
    run(f'chown -R tumanza:tumanza {REMOTE_APP}')

    # 2. Install dependencies and build as tumanza user
    code = run(f'cd {REMOTE_APP} && npm install', timeout=600, as_user=True)
    if code != 0:
        print('npm install failed')
        client.close()
        return code

    code = run(f'cd {REMOTE_APP} && npm run build', timeout=900, as_user=True)
    if code != 0:
        print('npm run build failed')
        client.close()
        return code

    # 3. Configure PM2 and restart
    run("pkill -u tumanza -f 'next-server' || true; pkill -u tumanza -f 'next start' || true; sleep 2")
    code = run(f'cd {REMOTE_APP} && pm2 restart tumanza || pm2 start ecosystem.config.cjs', as_user=True)
    if code != 0:
        run(f'cd {REMOTE_APP} && npx pm2 restart tumanza || npx pm2 start ecosystem.config.cjs', as_user=True)
    run('pm2 save')

    run('sleep 5')
    run('ss -tlnp | grep 3000 || true')
    run('curl -s https://tumanza.com/ | head -n 20')

    client.close()
    print('VPS DEPLOYMENT DONE SUCCESSFULLY')
    return 0

if __name__ == '__main__':
    sys.exit(main())
