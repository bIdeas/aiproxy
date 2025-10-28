# Peaceful LLM - File Structure & Architecture

Complete breakdown of all application files and their relationships.

## Directory Structure

```
zenhaiku_app/
├── index.html              # Main application UI
├── app.js                  # Core application logic
├── admin.html              # Admin console UI
├── admin.js                # Admin console logic
├── package.json            # NPM configuration
├── vercel.json             # Vercel deployment config
├── .gitignore              # Git ignore rules
├── .htaccess               # Web server routing & security
├── README.md               # Main documentation
├── QUICK_START.md          # 5-minute quickstart guide
├── DEPLOYMENT.md           # Deployment guide for all platforms
├── API.md                  # Complete API reference
└── FILE_STRUCTURE.md       # This file (architecture overview)
```

## Core Application Files

### index.html (≈500 lines)

**Purpose**: User interface and main application layout

**Sections**:
1. **Head Section** (lines 1-21)
   - Meta tags and viewport configuration
   - TailwindCSS CDN import
   - Custom styling for message types and UI elements

2. **Auth Screen** (lines 24-81)
   - Email input form
   - Session link management
   - AI provider testing display

3. **Main Proxy Screen** (lines 84-231)
   - Header with user info and API code
   - AI Providers management panel
   - Chat interface with message display
   - Prompt input area
   - Settings sidebar
   - Statistics panel
   - Action log panel

**Key Elements**:
- `#authScreen` - Authentication screen container
- `#mainScreen` - Main application screen container
- `#authForm` - Email submission form
- `#aiProvidersGrid` - AI providers selector
- `#messagesContainer` - Chat message display
- `#promptInput` - User input textarea
- `#actionLog` - Action history display

**Styling Classes**:
- `.message-user` - User message styling (blue)
- `.message-ai` - AI response styling (green)
- `.message-error` - Error message styling (red)
- `.message-system` - System message styling (purple)
- `.token-badge` - API code display styling
- `.ai-provider` - Provider card styling

### app.js (≈796 lines)

**Purpose**: Complete application logic and functionality

**Classes**:

#### PeacefulLLMProxy (lines 5-696)

Main application controller class.

**Properties**:
```javascript
this.currentUser            // Current email
this.currentSession         // Session data
this.providers              // 5 AI providers
this.messages               // Message history
this.requestCount           // Query count
this.sessionStart           // Session start time
this.actionLog              // Timestamped actions
this.encryptedDataStore     // Encryption handler
```

**Key Methods**:
- `initProviders()` - Initialize all AI providers
- `handleAuthSubmit()` - Email authentication
- `generateSessionLink()` - Create session token
- `activateSession()` - Validate and start session
- `sendPrompt()` - Process user input
- `getAIResponse()` - Get AI response with fallback
- `queryProvider()` - Query specific AI provider
- `queryGroq()` - Groq API integration
- `queryOpenAI()` - OpenAI API integration
- `queryTogetherAI()` - Together AI integration
- `queryHuggingFace()` - Hugging Face integration
- `queryOllama()` - Local Ollama integration
- `testAllProviders()` - Test all AI providers
- `log()` - Log actions and events
- `addMessage()` - Add message to chat
- `updateStats()` - Update UI statistics
- `renderAIProviders()` - Render provider selection UI
- `savePriorities()` - Save provider priorities
- `logout()` - End session

#### EncryptedDataStore (lines 697-788)

Handles client-side data encryption and persistence.

**Properties**:
```javascript
this.localCache            // In-memory cache
```

**Key Methods**:
- `saveUserData()` - Save encrypted data
- `getUserData()` - Retrieve encrypted data
- `encrypt()` - XOR-based encryption
- `decrypt()` - XOR-based decryption
- `hashString()` - Email-based key derivation
- `hashEmail()` - Email hashing for storage
- `saveToGist()` - GitHub Gist backup (stub)

**Encryption Details**:
- Algorithm: XOR (demo level)
- Key Derivation: Email hash
- Storage: localStorage + in-memory cache
- Format: Base64 encoded

### admin.html (≈300 lines)

**Purpose**: Admin console interface for token generation

**Sections**:
1. **Header** (lines 1-21)
   - Page title and styling

2. **Token Generator Form** (lines 24-38)
   - Email input
   - Phone input
   - Validity duration selector
   - Generate button

3. **Token Display** (lines 40-60)
   - Generated token display
   - Expiry information
   - Send confirmation
   - Copy button

4. **Settings Section** (lines 62-80)
   - Default session duration
   - Admin notification email
   - Save settings button

5. **Token History** (lines 82-88)
   - Last 10 generated tokens
   - Status indicators
   - Expiry tracking

**Key Elements**:
- `#tokenForm` - Token generation form
- `#tokenDisplay` - Generated token display area
- `#generatedToken` - Token display field
- `#tokenHistory` - Token history list
- `#saveSettingsBtn` - Settings save button

### admin.js (≈300 lines)

**Purpose**: Admin console functionality

**Class**: AdminConsole

**Properties**:
```javascript
this.adminToken            // Current generated token
this.tokenHistory          // Token history array
this.settings              // Admin settings
```

**Key Methods**:
- `generateToken()` - Generate 8-character token
- `generateRandomToken()` - Random token generator
- `copyToken()` - Copy token to clipboard
- `resetForm()` - Reset token form
- `saveSettings()` - Persist admin settings
- `loadSettings()` - Load settings from storage
- `saveTokenHistory()` - Save token history
- `loadTokenHistory()` - Load token history
- `displayTokenHistory()` - Render token history UI
- `simulateSending()` - Simulate email/SMS sending

## Configuration Files

### package.json

**Purpose**: NPM scripts and project metadata

**Scripts**:
```json
{
  "start": "npx http-server -p 8080",
  "serve": "npx http-server -p 3000",
  "dev": "npx http-server"
}
```

**Usage**: 
```bash
npm start      # Start on port 8080
npm run serve  # Start on port 3000
npm run dev    # Start on default port
```

### vercel.json

**Purpose**: Vercel deployment configuration

**Key Settings**:
- Build command: Static (no build needed)
- Output directory: `.` (root)
- Routes: SPA routing configuration

**Usage**: Deploy to Vercel with `vercel` command

### .gitignore

**Purpose**: Exclude files from version control

**Excluded**:
- `node_modules/` - Dependencies
- `.env` - Environment variables
- `dist/` - Build output
- `.DS_Store` - macOS system files
- `.idea/` - IDE configuration
- `*.log` - Log files

### .htaccess

**Purpose**: Web server configuration for Apache

**Features**:
1. **HTTPS Redirect**
   - Force HTTPS connections

2. **SPA Routing**
   - Route all requests to index.html

3. **Security Headers**
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Content-Security-Policy

4. **Caching**
   - Static assets: 30 days
   - HTML: 1 day
   - Images: 365 days

## Documentation Files

### README.md

**Purpose**: Main project documentation

**Sections**:
- Features overview
- Architecture explanation
- Getting started guide
- Configuration instructions
- API integration examples
- Deployment options
- Troubleshooting guide
- Contributing guidelines

### QUICK_START.md

**Purpose**: 5-minute getting started guide

**Covers**:
- Opening the application
- Creating a session
- Configuring providers
- First use
- Troubleshooting
- Tips and tricks
- API key resources

### DEPLOYMENT.md

**Purpose**: Platform-specific deployment guides

**Includes**:
- Vercel deployment
- GitHub Pages setup
- Netlify hosting
- AWS S3 + CloudFront
- Docker containerization
- Azure Static Web Apps
- Firebase Hosting
- Traditional web hosting
- Post-deployment verification
- Performance optimization

### API.md

**Purpose**: Developer API reference

**Covers**:
- Authentication methods
- Core class documentation
- Provider specifications
- Configuration formats
- Error handling
- Encryption details
- Integration examples
- Rate limiting
- Security recommendations

### FILE_STRUCTURE.md

**Purpose**: This document
- Architecture overview
- File descriptions
- Class documentation
- Component relationships
- Data flow diagrams

## Data Flow Architecture

### 1. Authentication Flow

```
User Email
    ↓
[generateSessionLink()]
    ↓
32-char Session Token + 16-char API Code
    ↓
[sendSessionLinkEmail()]
    ↓
FormSubmit.co → Email Delivery
    ↓
User clicks link or pastes it
    ↓
[activateSession()]
    ↓
[encryptedDataStore.getUserData()]
    ↓
Session activated, main screen shown
```

### 2. Query Flow

```
User Prompt
    ↓
[sendPrompt()]
    ↓
Add to messages, display in UI
    ↓
[getAIResponse()]
    ↓
Try providers in priority order
    ├─ Provider 1 (Priority 1)
    ├─ Provider 2 (Priority 2)
    ├─ Provider 3 (Priority 3)
    └─ Provider N
    ↓
[queryProvider(key, prompt, temp, tokens)]
    ↓
Provider-specific query method
    ├─ queryGroq()
    ├─ queryOpenAI()
    ├─ queryTogetherAI()
    ├─ queryHuggingFace()
    └─ queryOllama()
    ↓
HTTP Request to Provider API
    ↓
Parse Response
    ↓
Return to User
    ↓
Add to messages, log action
    ↓
Display in UI with provider attribution
```

### 3. Data Persistence Flow

```
User Settings/Data
    ↓
[encryptedDataStore.saveUserData()]
    ↓
Encrypt with email-derived key
    ↓
Store in localStorage
    ↓
[saveToGist()] - attempt remote backup
    ↓
GitHub Gist (optional, not implemented)
```

### 4. Action Logging Flow

```
Any Action (send prompt, test provider, etc.)
    ↓
[log(type, message, user)]
    ↓
Create timestamped entry
    ↓
Add to actionLog array
    ↓
Save to encrypted user data
    ↓
Display in recent actions panel
```

## State Management

### Session State

```javascript
currentSession = {
  email: "user@example.com",
  sessionToken: "...",
  apiCode: "...",
  createdAt: ISO8601,
  expiresAt: ISO8601,
  settings: {
    temperature: 0.7,
    maxTokens: 2000,
    aiPriorities: { groq: 1, ... }
  },
  actions: [ /* timestamped actions */ ]
}
```

### Provider State

```javascript
providers = {
  groq: {
    name, enabled, priority, icon, 
    endpoint, model, apiKey, 
    status, color
  },
  // ... 4 more providers
}
```

### Message State

```javascript
messages = [
  {
    type: "user",     // 'user', 'ai', 'system', 'error'
    content: "...",
    timestamp: ISO8601,
    provider: "Groq"  // only for AI messages
  },
  // ... more messages
]
```

### Action Log State

```javascript
actionLog = [
  {
    type: "action",   // 'action', 'error', 'system'
    message: "...",
    timestamp: ISO8601,
    user: "email@example.com"
  },
  // ... more actions
]
```

## Provider Integration Points

Each provider has:

1. **Configuration Object**
   - Name, icon, priority, color
   - API endpoint and model name
   - Status tracking

2. **Query Method**
   - `queryProviderName(prompt, temp, tokens)`
   - Handles authentication
   - Formats request
   - Parses response
   - Throws errors on failure

3. **Error Handling**
   - Catches API errors
   - Logs failures
   - Triggers fallback to next provider

4. **Testing**
   - Simple test prompt
   - Response time tracking
   - Status update

## Extension Points

### Adding New Provider

1. Add to `initProviders()`
2. Create `queryNewProvider()` method
3. Update `queryProvider()` switch statement
4. Add UI element (automatic via grid render)

### Adding New Storage Backend

1. Implement in `EncryptedDataStore`
2. Update `saveToGist()` method
3. Implement provider-specific authentication

### Adding New Message Type

1. Define in message constants
2. Add CSS class for styling
3. Update `addMessage()` for rendering

## Performance Considerations

### Optimizations

1. **Lazy Loading**: Providers tested on demand
2. **Caching**: Encrypted data cached in memory
3. **Debouncing**: Priority changes debounced
4. **Compression**: TailwindCSS CDN (minimal CSS)

### Potential Improvements

1. Service Workers for offline support
2. IndexedDB for larger data storage
3. Web Workers for encryption
4. Virtual scrolling for large message lists

## Security Layers

1. **Transport**: HTTPS recommended
2. **Storage**: XOR encryption (upgradeable to AES)
3. **Session**: Token-based, expirable
4. **API Keys**: Encrypted in localStorage
5. **CORS**: Provider-level validation

## Testing Checklist

- [ ] Session creation and validation
- [ ] All 5 providers respond
- [ ] Fallback system works
- [ ] Data encryption/decryption
- [ ] Message history persistence
- [ ] Settings save/load
- [ ] Token generation (admin)
- [ ] Action logging
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] Browser compatibility
- [ ] Performance under load

## Browser Compatibility

**Minimum Requirements**:
- ES6 JavaScript support
- Fetch API
- LocalStorage
- Async/await

**Tested On**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**For more details:**
- See README.md for features
- See DEPLOYMENT.md for hosting
- See API.md for integration
- See QUICK_START.md for first-use guide