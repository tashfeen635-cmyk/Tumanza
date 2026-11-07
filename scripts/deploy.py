import paramiko
import sys

host = '31.97.216.150'
port = 22
username = 'root'
password = '@CP@@Zp)bHzxHG6T'

commands = [
    'cd /var/www/Tumanza',
    'git stash',
    'git pull origin main',
    'npm install',
    'npm run build',
    'pm2 restart tumanza'
]

print(f"Connecting to {host}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=username, password=password, timeout=60)
    print("Connected successfully!")
    
    full_command = " && ".join(commands)
    print(f"Executing: {full_command}")
    
    stdin, stdout, stderr = client.exec_command(full_command, get_pty=True)
    
    while True:
        line = stdout.readline()
        if not line:
            break
        sys.stdout.buffer.write(line.encode('utf-8', errors='ignore'))
        sys.stdout.flush()
        
    err = stderr.read().decode('utf-8', errors='ignore')
    if err:
        print("STDERR:", err)
        
    print("Deployment script finished successfully.")
except Exception as e:
    print(f"Deployment failed: {e}")
    sys.exit(1)
finally:
    client.close()
