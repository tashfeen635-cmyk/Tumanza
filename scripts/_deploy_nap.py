import os
import sys
import tarfile
import tempfile
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]
HOST = os.environ.get('DEPLOY_HOST', '31.97.216.150')
USER = os.environ.get('DEPLOY_USER', 'root')
PASSWORD = os.environ['DEPLOY_PASS']
REMOTE_APP = '/var/www/Tumanza'

FILES = [
    'src/lib/constants.ts',
    'src/lib/site.ts',
    'src/lib/seo.ts',
    'src/app/contact/layout.tsx',
    'src/app/contact/page.tsx',
    'src/components/layout/Footer.tsx',
    'public/llms.txt',
]


def main() -> int:
    tar_path = Path(tempfile.gettempdir()) / 'tumanza-nap.tar.gz'
    with tarfile.open(tar_path, 'w:gz') as tar:
        for rel in FILES:
            path = ROOT / rel
            if not path.exists():
                print('MISSING', rel)
                return 1
            tar.add(path, arcname=rel)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30, allow_agent=False, look_for_keys=False)

    remote_tar = '/tmp/tumanza-nap.tar.gz'
    sftp = client.open_sftp()
    sftp.put(str(tar_path), remote_tar)
    sftp.close()

    def run(cmd: str, timeout: int = 600) -> int:
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

    run(f'tar -xzf {remote_tar} -C {REMOTE_APP}')
    run(
        f'chown -R tumanza:tumanza '
        f'{REMOTE_APP}/src/lib/constants.ts {REMOTE_APP}/src/lib/site.ts {REMOTE_APP}/src/lib/seo.ts '
        f'{REMOTE_APP}/src/app/contact {REMOTE_APP}/src/components/layout/Footer.tsx {REMOTE_APP}/public/llms.txt'
    )
    code = run(f'su -s /bin/bash tumanza -c "cd {REMOTE_APP} && npm run build"', timeout=900)
    if code != 0:
        client.close()
        return code

    run("pkill -u tumanza -f 'next-server' || true; pkill -u tumanza -f 'next start' || true; sleep 2")
    run(f"su -s /bin/bash tumanza -c 'cd {REMOTE_APP} && nohup npm start > {REMOTE_APP}/next.log 2>&1 &'")
    run('sleep 4')
    # if port busy, existing process may still be old — force kill by port then start
    run("fuser -k 3000/tcp || true; sleep 1")
    run(f"su -s /bin/bash tumanza -c 'cd {REMOTE_APP} && nohup npm start > {REMOTE_APP}/next.log 2>&1 &'")
    run('sleep 5')
    run('ss -tlnp | grep 3000 || true')
    run('curl -s https://tumanza.com/contact | grep -Eo "info@tumanza.com|0317-0885816|Media Town|Portland|hello@tumanza" | sort -u')
    run('curl -s https://tumanza.com/ | grep -Eo "info@tumanza.com|0317-0885816|Media Town|hello@tumanza" | sort -u')
    client.close()
    tar_path.unlink(missing_ok=True)
    print('NAP DEPLOY DONE')
    return 0


if __name__ == '__main__':
    sys.exit(main())
