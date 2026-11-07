import paramiko
import sys

host = '31.97.216.150'
port = 22
username = 'root'
password = '@CP@@Zp)bHzxHG6T'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, port=port, username=username, password=password, timeout=30)
    
    def run_cmd(cmd):
        print(f"\n--- RUNNING: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            sys.stdout.buffer.write(out.encode('utf-8', errors='ignore'))
            sys.stdout.flush()
        if err:
            sys.stdout.buffer.write(f"STDERR: {err}\n".encode('utf-8', errors='ignore'))
            sys.stdout.flush()
        return out

    # Check Header.tsx on VPS
    run_cmd('cat /var/www/Tumanza/src/components/layout/Header.tsx | grep -i "logo"')

    # Perform clean git reset and pull on VPS
    run_cmd('cd /var/www/Tumanza && git fetch origin && git reset --hard origin/main && npm install && npm run build && pm2 restart tumanza')

    # Verify HTML again
    run_cmd('curl -s https://tumanza.com | grep -i "logo" || echo "No logo found"')

except Exception as e:
    print("Diagnosis error:", e)
finally:
    client.close()
