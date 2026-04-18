# PythonAnywhere Deployment Guide for Telegram LongChat Bot

## Prerequisites

1. PythonAnywhere account (free or paid)
2. Git installed on PythonAnywhere (available by default)
3. Node.js 18+ (PythonAnywhere supports Node.js via their "Web apps" feature)

## Important: Node.js on PythonAnywhere

PythonAnywhere may not have Node.js/npm installed by default. Here's how to install it:

### Option A: Install Node.js via Node Version Manager (nvm)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 18 (LTS)
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

### Option B: Use PythonAnywhere's Node.js (if available)

Some PythonAnywhere instances have Node.js pre-installed. Check with:

```bash
which node
which npm
```

### Option C: Use system Node.js (if available)

```bash
# Check available versions
nodejs --version

# If only nodejs is available, create symlink
sudo ln -s /usr/bin/nodejs /usr/bin/node
```

## Deployment Steps

### 1. Clone the Repository

```bash
cd ~
git clone https://github.com/yuggu7665-beep/telegram-longchat-bot.git
cd telegram-longchat-bot
```

### 2. Install Dependencies

```bash
npm install --omit=dev
```

If `npm` is not found, install Node.js first using Option A above.

### 3. Set Environment Variables

PythonAnywhere requires environment variables to be set in the Web app configuration. Use these exact values from your .env file:

**Required Environment Variables:**

```
BOT_TOKEN=8754260621:AAEgftJZ1Z-1DyRtF2599UF37FoK0itm9lk
LONGCHAT_API_KEY=ak_24e4WW3Bn3tf1vj2zR9yR2C01qN13
LONGCHAT_API_URL=https://api.longchat.ai/v1/chat/completions
NODE_ENV=production
PORT=8080
ALWAYS_START_SERVER=true
MAX_REQUESTS_PER_MINUTE=5
MAX_HISTORY_STORAGE=10
OUTPUT_DIR=./outputs
```

**How to set them in PythonAnywhere:**

1. Go to your Web app configuration page
2. Scroll to "Environment variables" section
3. Add each variable individually:
   - Name: `BOT_TOKEN`, Value: `8754260621:AAEgftJZ1Z-1DyRtF2599UF37FoK0itm9lk`
   - Name: `LONGCHAT_API_KEY`, Value: `ak_24e4WW3Bn3tf1vj2zR9yR2C01qN13`
   - Name: `LONGCHAT_API_URL`, Value: `https://api.longchat.ai/v1/chat/completions`
   - Name: `NODE_ENV`, Value: `production`
   - Name: `PORT`, Value: `8080`
   - Name: `ALWAYS_START_SERVER`, Value: `true`
   - Name: `MAX_REQUESTS_PER_MINUTE`, Value: `5`
   - Name: `MAX_HISTORY_STORAGE`, Value: `10`
   - Name: `OUTPUT_DIR`, Value: `./outputs`

### 4. Configure PythonAnywhere Web App

1. Go to the **Web** tab in your PythonAnywhere dashboard
2. Click **"Add a new web app"**
3. Choose **"Manual configuration"** (not Flask/Django)
4. Select **Python 3.9** or higher (this doesn't matter for Node.js)
5. Click through to finish setup

### 5. Configure Virtual Environment and Node.js

In the Web app configuration page:

1. **Virtualenv**: Leave empty or create a Python virtualenv (optional)
2. **Source code**: Set to `/home/yourusername/telegram-longchat-bot`
3. **Working directory**: Set to `/home/yourusername/telegram-longchat-bot`

### 6. Create a WSGI Configuration File

Create a file at `/var/www/yourusername_pythonanywhere_com_wsgi.py` with the following content:

```python
#!/usr/bin/python
import os
import sys

# Add your project to the path
project_home = '/home/yourusername/telegram-longchat-bot'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['BOT_TOKEN'] = '8754260621:AAEgftJZ1Z-1DyRtF2599UF37FoK0itm9lk'
os.environ['LONGCHAT_API_KEY'] = 'ak_24e4WW3Bn3tf1vj2zR9yR2C01qN13'
os.environ['LONGCHAT_API_URL'] = 'https://api.longchat.ai/v1/chat/completions'
os.environ['NODE_ENV'] = 'production'
os.environ['PORT'] = '8080'
os.environ['ALWAYS_START_SERVER'] = 'true'
os.environ['MAX_REQUESTS_PER_MINUTE'] = '5'
os.environ['MAX_HISTORY_STORAGE'] = '10'
os.environ['OUTPUT_DIR'] = './outputs'

# Start the Node.js application
import subprocess

# Change to project directory
os.chdir(project_home)

# Start the Node.js server
proc = subprocess.Popen(['node', 'pythonanywhere_start.js'],
                       stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE)

# Keep the process running
print("Node.js bot server started")
```

### 7. Alternative: Simple Startup Script

Alternatively, you can use a simpler approach by creating a startup script and configuring the web app to run it:

1. Make the startup script executable:

```bash
chmod +x pythonanywhere_start.js
```

2. In the Web app configuration, under **"Code"** section, set:
   - **Source code**: `/home/yourusername/telegram-longchat-bot`
   - **Working directory**: `/home/yourusername/telegram-longchat-bot`

3. In the **"WSGI configuration file"** section, replace the content with:

```python
import os
import sys
import subprocess

sys.path.insert(0, '/home/yourusername/telegram-longchat-bot')
os.chdir('/home/yourusername/telegram-longchat-bot')

# Set environment variables
os.environ.update({
    'BOT_TOKEN': '8754260621:AAEgftJZ1Z-1DyRtF2599UF37FoK0itm9lk',
    'LONGCHAT_API_KEY': 'ak_24e4WW3Bn3tf1vj2zR9yR2C01qN13',
    'LONGCHAT_API_URL': 'https://api.longchat.ai/v1/chat/completions',
    'NODE_ENV': 'production',
    'PORT': '8080',
    'ALWAYS_START_SERVER': 'true',
    'MAX_REQUESTS_PER_MINUTE': '5',
    'MAX_HISTORY_STORAGE': '10',
    'OUTPUT_DIR': './outputs'
})

# Start Node.js process
from subprocess import Popen
Popen(['node', 'pythonanywhere_start.js'])
```

### 8. Reload the Web App

Click the **Reload** button on your PythonAnywhere Web tab.

### 9. Check Logs

Monitor your application logs:

- **Error log**: `/var/log/yourusername.pythonanywhere.com.error.log`
- **Access log**: `/var/log/yourusername.pythonanywhere.com.access.log`

### 10. Verify Deployment

Visit your PythonAnywhere domain:

- `https://yourusername.pythonanywhere.com/health` - Should return JSON health status
- `https://yourusername.pythonanywhere.com/` - Should return bot information

## Troubleshooting

### Common Issues

1. **"bash: npm: command not found"**: Install Node.js using Option A above
2. **Port already in use**: Ensure `PORT` environment variable matches PythonAnywhere's internal port (usually 8080)
3. **Missing dependencies**: Run `npm install` in the project directory
4. **Environment variables not set**: Double-check they're set in the WSGI file or PythonAnywhere's Web app configuration
5. **Bot not responding**: Check Telegram Bot token is correct and the bot is started

### Checking if Bot is Running

SSH into PythonAnywhere and check processes:

```bash
ps aux | grep node
```

### Restarting the Bot

1. Reload the web app from PythonAnywhere dashboard
2. Or restart via bash:

```bash
pkill -f node
cd ~/telegram-longchat-bot
node pythonanywhere_start.js
```

## Notes

- PythonAnywhere free tier has limitations:
  - Web apps must receive traffic within 3 months
  - Limited CPU time
  - Sleeps after inactivity
- For 24/7 bot operation, consider upgrading to paid plan or using a different service
- The bot will automatically restart when the web app reloads
- All environment variables from your local `.env` file have been pre-configured in the WSGI examples above
""  
"## Alternative: Using Bash Startup Script"  
""  
"If you're having issues with the WSGI configuration, you can use the provided bash script:"  
""  
"1. Make the script executable:"  
'```bash'  
"chmod +x start_pythonanywhere.sh"  
'```'  
""  
"2. Update your WSGI file to use the bash script:"  
'```python'  
"import os"  
"import sys"  
"import subprocess"  
""  
"sys.path.insert(0, '/home/yourusername/telegram-longchat-bot')"  
"os.chdir('/home/yourusername/telegram-longchat-bot')"  
""  
"# Set environment variables here or in PythonAnywhere web app config"  
"os.environ['NODE_ENV'] = 'production'"  
"os.environ['PORT'] = '8080'"  
""  
"# Start using bash script"  
"from subprocess import Popen"  
"Popen(['bash', 'start_pythonanywhere.sh'])"  
'```' 
