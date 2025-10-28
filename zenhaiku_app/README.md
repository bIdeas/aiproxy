# Peaceful LLM - AI Proxy Application

A sophisticated, fully static AI proxy webpage that provides secure, multi-provider AI access with intelligent fallback capabilities.

## Features

🔐 **Security**
- End-to-end encrypted session management
- Expirable session links (365 days default)
- Client-side data encryption (XOR, upgradeable to AES-256)
- No backend required, no server-side storage

🤖 **Multi-Provider AI Integration**
- **Groq** (Mixtral-8x7b-32768) - Fastest free tier
- **OpenAI** (GPT-3.5-turbo)
- **Together AI** (Llama-2-70b-chat-hf)
- **Hugging Face** (Mistral-7B-Instruct)
- **Local Ollama** (Neural-chat for offline use)

⚡ **Intelligent Fallback System**
- Automatic provider switching on error
- Real-time provider status monitoring
- User-configurable provider priorities
- Enable/disable individual providers

📊 **Advanced Features**
- Formatted, colored AI communication display
- API code generation (16-character tokens)
- Action logging with timestamps
- User settings persistence per email
- Real-time provider response time monitoring
- Configurable temperature (0-2.0) and max tokens (100-4000)

🎨 **User Interface**
- Modern TailwindCSS design
- Responsive mobile-friendly layout
- Real-time status indicators
- Session statistics and analytics
- Comprehensive admin console

## Architecture

### Files

- **index.html** - Main application UI (500 lines)
  - Authentication screen with email-based session setup
  - Main proxy interface with chat and provider management
  - Admin controls and settings panel

- **app.js** - Core application logic (796 lines)
  - `PeacefulLLMProxy` class - Main application controller
  - `EncryptedDataStore` class - Client-side data encryption and storage
  - Provider integration for 5 AI services
  - Session management and authentication
  - Action logging and statistics

- **admin.html** - Admin console (300 lines)
  - Token generation interface
  - Admin settings management
  - Token history tracking
  - Email/SMS delivery simulation

- **admin.js** - Admin console logic (300 lines)
  - Token generation and validation
  - Settings persistence
  - Token history management

## Getting Started

### Option 1: Direct Browser Access

1. Open `index.html` in a modern web browser
2. Enter your email address to receive a session link
3. Check your email for the session link (or paste it directly in the app)
4. Add your AI provider API keys in the settings
5. Start using the AI proxy

### Option 2: Local Server

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx http-server -p 8000

# Using npm
npm start
```

Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd zenhaiku_app
vercel
```

### Option 4: Deploy to GitHub Pages

1. Push the `zenhaiku_app` folder to your GitHub repository
2. Go to Settings → Pages
3. Set source to "GitHub Actions"
4. Use the "Static HTML" workflow

## Configuration

### API Keys

Set your API keys in the application settings (they're stored encrypted locally):

- **Groq API**: Get from https://console.groq.com
- **OpenAI API**: Get from https://platform.openai.com
- **Together AI API**: Get from https://www.together.ai
- **Hugging Face Token**: Get from https://huggingface.co/settings/tokens
- **Ollama**: No key needed (local deployment)

### Provider Priorities

In the main interface, adjust provider priorities using the number inputs. Lower numbers = higher priority.

### Session Duration

Default: 365 days
Modify in: `Admin Console` → `Settings` → `Default Session Duration`

### Temperature & Max Tokens

- **Temperature**: Affects response creativity (0=deterministic, 2=maximum randomness)
- **Max Tokens**: Limits response length (100-4000 characters)

## How It Works

### Session Flow

1. **Email Entry**: User enters email on auth screen
2. **Session Generation**: App generates unique 32-character session token
3. **Link Delivery**: Session link sent via FormSubmit.co (no registration needed)
4. **Link Validation**: User opens link or pastes it into the app
5. **Session Activation**: App verifies token and loads user settings
6. **Encrypted Storage**: All data stored encrypted in browser localStorage

### AI Query Flow

1. **User Prompt**: User enters a question/prompt
2. **Provider Selection**: App tries providers in priority order
3. **Request Sent**: First available provider receives the query
4. **Response Handling**: Response displayed with provider attribution
5. **Fallback**: If provider fails, automatically tries the next one
6. **Action Logged**: All interactions logged with timestamps

## Security Considerations

### Current Implementation (Demo Level)

- XOR-based encryption for data storage
- Client-side only (no server exposure)
- localStorage isolation per browser

### Production Recommendations

1. **Upgrade Encryption**: Implement AES-256 using TweetNaCl.js or libsodium.js
2. **HTTPS Only**: Always deploy over HTTPS
3. **API Key Management**: 
   - Consider using a secure key management service
   - Never expose keys in client-side code
   - Use encrypted environment variables
4. **Rate Limiting**: Add rate limiting per API key
5. **Token Rotation**: Implement periodic session token rotation
6. **Audit Logging**: Log all admin activities

## API Integration Guide

### Adding a Custom AI Provider

Edit `app.js` and add to `initProviders()`:

```javascript
customProvider: {
    name: 'Custom AI',
    enabled: true,
    priority: 3,
    icon: '✨',
    endpoint: 'https://api.example.com/v1/chat',
    model: 'model-name',
    apiKey: '',
    status: 'unknown',
    color: '#00FF00'
}
```

Then add a query method:

```javascript
async queryCustomProvider(prompt, temperature, maxTokens) {
    const apiKey = this.currentSession.settings.customApiKey || '';
    if (!apiKey) throw new Error('Custom requires API key');
    
    const response = await fetch('https://api.example.com/v1/chat', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'model-name',
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens
        })
    });
    
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response';
}
```

Update `queryProvider()` switch statement:

```javascript
case 'customprovider':
    return await this.queryCustomProvider(prompt, temperature, maxTokens);
```

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify email address is correct
3. In browser console, check network requests to FormSubmit.co
4. Session link is still available in app under "Or paste your session link"

### Provider Returns Error

1. Verify API key is correct
2. Check provider status with "Test All Providers" button
3. Try a different provider (fallback should engage automatically)
4. Check browser console for detailed error messages

### Session Expired

1. Generate a new session link with your email
2. Previous conversations cannot be recovered
3. Settings may be preserved in localStorage if not cleared

### No Providers Working

1. Check internet connection
2. Verify at least one API key is configured
3. Open browser DevTools → Network tab to see request errors
4. Try local Ollama if installed

## Deployment Options

### Vercel (Recommended)

```bash
vercel
```

### Netlify

Drag and drop the `zenhaiku_app` folder to https://app.netlify.com/drop

### GitHub Pages

Push to `gh-pages` branch, enable in repository settings.

### Docker

```dockerfile
FROM nginx:alpine
COPY zenhaiku_app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t peaceful-llm .
docker run -p 8080:80 peaceful-llm
```

### AWS S3 + CloudFront

1. Create S3 bucket
2. Enable static website hosting
3. Upload `zenhaiku_app` contents
4. Create CloudFront distribution
5. Point domain to CloudFront

## Performance Tips

- Use Groq API for fastest responses
- Reduce max tokens for quicker responses
- Disable unused providers
- Lower temperature for more deterministic responses
- Use local Ollama for offline access

## Support & Issues

For issues, feature requests, or security concerns:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Test individual providers to isolate problems
4. Clear browser cache and localStorage if experiencing issues

## License

MIT - Open source and free to use

## Contributing

Contributions welcome! Areas for enhancement:
- Additional AI providers
- Enhanced encryption methods
- Real-time collaboration features
- Analytics dashboard
- Mobile app version
- Conversation history sync

---

**Built with ❤️ for the AI community**

Zero backend. Zero registration. Pure client-side AI proxy.