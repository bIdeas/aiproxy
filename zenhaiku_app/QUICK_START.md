# Peaceful LLM - Quick Start Guide

Get started with Peaceful LLM in 5 minutes!

## Step 1: Open the Application (30 seconds)

**Option A: Local Browser**
1. Right-click `index.html`
2. Select "Open with" → Your browser
3. Done! ✓

**Option B: Local Server**
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

**Option C: Online**
- Deploy using instructions in DEPLOYMENT.md
- Access via provided URL

## Step 2: Create a Session (2 minutes)

1. Enter your email address
2. Click "Get Session Link"
3. Check your email inbox (or spam folder)
4. Click the session link or paste it in the app
5. Enjoy! ✓

**Note**: If email service is down, you can paste the link directly into "Or paste your session link" section.

## Step 3: Configure AI Providers (2 minutes)

### Quick Setup (Fastest)

**Use Groq (Recommended - Free & Fast)**

1. Get free API key: https://console.groq.com
2. In the app, go to Settings
3. Paste Groq API key
4. Click "Test All Providers"
5. See Groq as "ACTIVE" ✓

### Add More Providers (Optional)

Other free options:
- **OpenAI**: https://platform.openai.com (free trial credits)
- **Together AI**: https://www.together.ai (free tier)
- **Hugging Face**: https://huggingface.co (free tokens)
- **Local Ollama**: https://ollama.ai (completely free, offline)

## Step 4: Start Using (1 minute)

1. Type a question in the prompt box
2. Press Shift+Enter or click Send
3. See the AI respond
4. Adjust temperature and max tokens if needed
5. Enjoy unlimited AI access! ✓

## Troubleshooting

### "Session link not received"
- Check spam folder
- Try entering it manually in the text box
- Refresh the page

### "Groq Error: No API key"
- Generate free API key at https://console.groq.com
- Add it in Settings → API Keys
- Test again

### "All providers failed"
- Ensure at least one API key is configured
- Click "Test All Providers"
- Check browser console (F12) for errors
- Try local Ollama (offline option)

### "Response is slow"
- Switch to Groq (fastest)
- Reduce max tokens
- Lower temperature
- Close other browser tabs

## Tips & Tricks

### 1. Use Keyboard Shortcuts
- **Shift+Enter**: Send message quickly
- **Tab+Enter**: In settings

### 2. Copy API Code
- Click "Copy Code" to get your API code
- Use it in your own applications

### 3. Monitor Provider Performance
- Watch response times in the Stats panel
- See which provider is active
- Switch priorities if needed

### 4. Adjust Settings
- **Temperature**: 0 (consistent) → 2 (creative)
- **Max Tokens**: Lower = faster, Higher = longer responses
- **Priority**: 1 (highest), 5 (lowest)

### 5. Check Action Log
- See all your interactions timestamped
- Useful for debugging
- Actions saved per session

## API Key Resources

| Provider | Get Key | Speed | Cost | Docs |
|----------|---------|-------|------|------|
| Groq | https://console.groq.com | ⚡⚡⚡ | Free | https://console.groq.com/docs |
| OpenAI | https://platform.openai.com | ⚡⚡ | $0.01 | https://platform.openai.com/docs |
| Together AI | https://www.together.ai | ⚡⚡⚡ | Free | https://www.together.ai/api |
| Hugging Face | https://huggingface.co | ⚡ | Free | https://huggingface.co/docs/api |
| Ollama | https://ollama.ai | ⚡⚡ | Free | https://github.com/jmorganca/ollama |

## Free Trial Options

### Groq (Best for Starting)
- **Free**: Unlimited API calls
- **Speed**: Fastest free tier
- **Model**: Mixtral-8x7b (excellent)
- **Get Started**: 5 seconds

### OpenAI Free Trial
- **Free**: $5 trial credit (3 months)
- **Model**: GPT-3.5-turbo (reliable)
- **Cost**: ~$0.01 per 1K tokens

### Together AI Free Tier
- **Free**: Generous free tier
- **Models**: Multiple LLaMA models
- **Get Started**: Instant

### Hugging Face Free
- **Free**: API calls with rate limits
- **Models**: Mistral, LLaMA, etc.
- **Speed**: Slower but solid

### Local Ollama (Best Privacy)
- **Free**: Completely free, offline
- **Setup**: 5 minutes
- **Speed**: Depends on your computer
- **Privacy**: 100% local, no data sent

## Next Steps

Once you're comfortable:

1. **Add More Providers**: Mix and match for best results
2. **Set Priorities**: Order providers by your preference
3. **Fine-tune Settings**: Adjust temperature/tokens
4. **Save Settings**: They persist automatically
5. **Explore**: Try different prompts and learn what works

## Common Questions

**Q: Is my data safe?**
A: Yes! All data is encrypted locally. No backend server exists.

**Q: Can I use multiple providers?**
A: Yes! The app automatically tries them in priority order.

**Q: What happens if a provider goes down?**
A: The app automatically switches to the next one.

**Q: Can I use this offline?**
A: Yes! Install Ollama and use the local provider.

**Q: How long do sessions last?**
A: 365 days by default. Configurable in Admin Console.

**Q: Can I access from multiple devices?**
A: Yes! Just use the same session link on any device.

## Security Best Practices

1. **Use HTTPS**: Always use secure connections
2. **API Keys**: Keep them private, use admin console
3. **Sessions**: Don't share session links
4. **Passwords**: Not used (token-based auth)
5. **Local Data**: Encrypted in browser storage

## Getting Help

- Check the README.md for full documentation
- Review browser console (F12) for error messages
- Test each provider individually
- Try a different provider if one fails
- Reset browser cache if stuck

## Ready to Go! 🚀

You now have everything you need:
- ✅ Application running
- ✅ Session created
- ✅ At least one AI provider configured
- ✅ Understanding of key features

**Start asking questions!**

```
"What is machine learning?"
"Write a haiku about coding"
"Explain quantum computing simply"
```

Enjoy your AI journey! 🤖✨

---

**Questions?** Check README.md for detailed docs.
**Want to deploy?** See DEPLOYMENT.md.
**Need admin features?** Visit the Admin Console.