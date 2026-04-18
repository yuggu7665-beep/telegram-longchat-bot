# PythonAnywhere Deployment Guide for Telegram LongChat Bot

## Prerequisites

1. PythonAnywhere account (free or paid)
2. Git installed on PythonAnywhere (available by default)
3. Node.js 18+ (PythonAnywhere supports Node.js via their "Web apps" feature)

## Deployment Steps

### 1. Clone the Repository

```bash
cd ~
git clone https://github.com/your-username/telegram-longchat-bot.git
cd telegram-longchat-bot
```

### 2. Install Dependencies

```bash
npm install --omit=dev
```

### 3. Set Environment Variables

Create a `.env` file in the project root:

```bash
nano .env
```

Add the following (replace with your actual values):

```
BOT_TOKEN=your_telegram_bot_token_here
LONGCHAT_API_KEY=your_longchat_api_key_here
NODE_ENV=production
PORT=8080
ALWAYS_START_SERVER=true
```

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
os.environ['BOT_TOKEN'] = 'your_telegram_bot_token_here'
os.environ['LONGCHAT_API_KEY'] = 'your_longchat_api_key_here'
os.environ['NODE_ENV'] = 'production'
os.environ['PORT'] = '8080'
os.environ['ALWAYS_START_SERVER'] = 'true'

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
    'BOT_TOKEN': 'your_actual_bot_token',
    'LONGCHAT_API_KEY': 'your_actual_api_key',
    'NODE_ENV': 'production',
    'PORT': '8080',
    'ALWAYS_START_SERVER': 'true'
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

1. **Port already in use**: Ensure `PORT` environment variable matches PythonAnywhere's internal port (usually 8080)
2. **Missing dependencies**: Run `npm install` in the project directory
3. **Environment variables not set**: Double-check they're set in the WSGI file or PythonAnywhere's Web app configuration
4. **Bot not responding**: Check Telegram Bot token is correct and the bot is started

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
