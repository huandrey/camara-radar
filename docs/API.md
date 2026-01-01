# Câmara Radar API Documentation

## Introduction

The Câmara Radar API provides programmatic access to legislative session data from Campina Grande's City Council. This REST API allows developers to query session information and trigger on-demand data collection.

## Base URL

The API runs locally by default:

```
http://localhost:3000
```

You can configure the port using the `PORT` environment variable.

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/api/sessions/:id` | Get details of a specific session |
| POST | `/api/sessions/:id/collect` | Trigger data collection for a session |
| GET | `/api/sessions` | List sessions with pagination |

---

## Endpoint Details

### Health Check

Check if the API is running and responsive.

**Endpoint:** `GET /api/health`

**Parameters:** None

**Success Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-12-30T10:00:00.000Z",
  "uptime": 3600.5
}
```

**Example:**

```bash
curl http://localhost:3000/api/health
```

---

### Get Session by ID

Retrieve detailed information about a specific legislative session.

**Endpoint:** `GET /api/sessions/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | The session ID |

**Success Response (200):**

```json
{
  "id": 123,
  "title": "55ª Sessão Ordinária",
  "type": "Ordinária",
  "openingDate": "2025-12-15T10:00:00.000Z",
  "legislature": "19ª Legislatura",
  "legislativeSession": "1º Sessão Legislativa",
  "url": "https://sapl.campinagrande.pb.leg.br/sessao/123",
  "detalhesColetados": "COLETADO",
  "scrapedAt": "2025-12-30T15:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid session ID format
  ```json
  {
    "error": "Invalid session ID",
    "code": "INVALID_PARAMETER",
    "details": {
      "parameter": "id",
      "value": "abc"
    }
  }
  ```

- **404 Not Found** - Session does not exist
  ```json
  {
    "error": "Session 123 not found",
    "code": "NOT_FOUND",
    "details": {
      "sessionId": 123
    }
  }
  ```

**Examples:**

**cURL:**
```bash
curl http://localhost:3000/api/sessions/123
```

**Node.js (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/sessions/123');
const session = await response.json();
console.log(session);
```

**Python (requests):**
```python
import requests

response = requests.get('http://localhost:3000/api/sessions/123')
session = response.json()
print(session)
```

**TypeScript (axios):**
```typescript
import axios from 'axios';

const { data: session } = await axios.get('http://localhost:3000/api/sessions/123');
console.log(session);
```

---

### Trigger Data Collection

Trigger on-demand data collection for a specific session. This endpoint initiates the data collection process for sessions that haven't been collected yet or have errors.

**Endpoint:** `POST /api/sessions/:id/collect`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | The session ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Data collection completed successfully",
  "session": {
    "id": 123,
    "title": "55ª Sessão Ordinária",
    "type": "Ordinária",
    "openingDate": "2025-12-15T10:00:00.000Z",
    "legislature": "19ª Legislatura",
    "legislativeSession": "1º Sessão Legislativa",
    "url": "https://sapl.campinagrande.pb.leg.br/sessao/123",
    "detalhesColetados": "COLETADO",
    "scrapedAt": "2025-12-30T15:30:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid session ID format
  ```json
  {
    "error": "Invalid session ID",
    "code": "INVALID_PARAMETER",
    "details": {
      "parameter": "id",
      "value": "abc"
    }
  }
  ```

- **404 Not Found** - Session does not exist
  ```json
  {
    "error": "Session 123 not found",
    "code": "NOT_FOUND",
    "details": {
      "sessionId": 123
    }
  }
  ```

- **409 Conflict** - Session is already being processed
  ```json
  {
    "error": "Session 123 is already being processed",
    "code": "ALREADY_PROCESSING",
    "details": {
      "sessionId": 123
    }
  }
  ```

**Examples:**

**cURL:**
```bash
curl -X POST http://localhost:3000/api/sessions/123/collect
```

**Node.js (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/sessions/123/collect', {
  method: 'POST'
});
const result = await response.json();
console.log(result);
```

**Python (requests):**
```python
import requests

response = requests.post('http://localhost:3000/api/sessions/123/collect')
result = response.json()
print(result)
```

**TypeScript (axios):**
```typescript
import axios from 'axios';

const { data: result } = await axios.post('http://localhost:3000/api/sessions/123/collect');
console.log(result);
```

---

### List Sessions

List sessions with pagination support. Results are ordered by opening date (most recent first).

**Endpoint:** `GET /api/sessions`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (minimum: 1) |
| limit | number | No | 10 | Items per page (minimum: 1, maximum: 100) |

**Success Response (200):**

```json
{
  "sessions": [
    {
      "id": 123,
      "title": "55ª Sessão Ordinária",
      "type": "Ordinária",
      "openingDate": "2025-12-15T10:00:00.000Z",
      "legislature": "19ª Legislatura",
      "legislativeSession": "1º Sessão Legislativa",
      "url": "https://sapl.campinagrande.pb.leg.br/sessao/123",
      "detalhesColetados": "COLETADO",
      "scrapedAt": "2025-12-30T15:30:00.000Z"
    },
    {
      "id": 122,
      "title": "54ª Sessão Ordinária",
      "type": "Ordinária",
      "openingDate": "2025-12-14T10:00:00.000Z",
      "legislature": "19ª Legislatura",
      "legislativeSession": "1º Sessão Legislativa",
      "url": "https://sapl.campinagrande.pb.leg.br/sessao/122",
      "detalhesColetados": "NAO_COLETADO",
      "scrapedAt": "2025-12-30T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid pagination parameters
  ```json
  {
    "error": "Page must be greater than 0",
    "code": "INVALID_PARAMETER",
    "details": {
      "parameter": "page",
      "value": 0
    }
  }
  ```

  ```json
  {
    "error": "Limit must be between 1 and 100",
    "code": "INVALID_PARAMETER",
    "details": {
      "parameter": "limit",
      "value": 200
    }
  }
  ```

**Examples:**

**cURL:**
```bash
# Get first page with 10 items (default)
curl "http://localhost:3000/api/sessions"

# Get second page with 20 items
curl "http://localhost:3000/api/sessions?page=2&limit=20"

# Get first page with maximum items
curl "http://localhost:3000/api/sessions?page=1&limit=100"
```

**Node.js (fetch):**
```javascript
// Get first page
const response = await fetch('http://localhost:3000/api/sessions?page=1&limit=10');
const data = await response.json();
console.log(`Total sessions: ${data.pagination.total}`);
console.log(`Sessions on this page: ${data.sessions.length}`);

// Iterate through all pages
async function getAllSessions() {
  const allSessions = [];
  let page = 1;
  
  while (true) {
    const response = await fetch(`http://localhost:3000/api/sessions?page=${page}&limit=50`);
    const data = await response.json();
    
    allSessions.push(...data.sessions);
    
    if (page >= data.pagination.totalPages) {
      break;
    }
    
    page++;
  }
  
  return allSessions;
}
```

**Python (requests):**
```python
import requests

# Get first page
response = requests.get('http://localhost:3000/api/sessions', params={
    'page': 1,
    'limit': 10
})
data = response.json()
print(f"Total sessions: {data['pagination']['total']}")
print(f"Sessions on this page: {len(data['sessions'])}")

# Iterate through all pages
def get_all_sessions():
    all_sessions = []
    page = 1
    
    while True:
        response = requests.get('http://localhost:3000/api/sessions', params={
            'page': page,
            'limit': 50
        })
        data = response.json()
        
        all_sessions.extend(data['sessions'])
        
        if page >= data['pagination']['totalPages']:
            break
        
        page += 1
    
    return all_sessions
```

**TypeScript (axios):**
```typescript
import axios from 'axios';

// Get first page
const { data } = await axios.get('http://localhost:3000/api/sessions', {
  params: { page: 1, limit: 10 }
});
console.log(`Total sessions: ${data.pagination.total}`);

// Iterate through all pages
async function getAllSessions() {
  const allSessions = [];
  let page = 1;
  
  while (true) {
    const { data } = await axios.get('http://localhost:3000/api/sessions', {
      params: { page, limit: 50 }
    });
    
    allSessions.push(...data.sessions);
    
    if (page >= data.pagination.totalPages) {
      break;
    }
    
    page++;
  }
  
  return allSessions;
}
```

---

## Data Structures

### Session Object

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique session identifier |
| title | string | Session title (e.g., "55ª Sessão Ordinária") |
| type | string | Session type (e.g., "Ordinária", "Extraordinária") |
| openingDate | string | Session opening date (ISO 8601 format) |
| legislature | string | Legislature period (e.g., "19ª Legislatura") |
| legislativeSession | string | Legislative session (e.g., "1º Sessão Legislativa") |
| url | string | URL to the session on SAPL system |
| detalhesColetados | string | Collection status (see below) |
| scrapedAt | string | Last collection timestamp (ISO 8601 format) |

### Collection Status Values

| Status | Description |
|--------|-------------|
| NAO_COLETADO | Details not collected yet |
| PROCESSANDO | Collection in progress |
| COLETADO | Details successfully collected |
| ERRO | Error occurred during collection |

---

## Error Handling

All error responses follow this structure:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional context (optional)
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_PARAMETER | 400 | Invalid request parameter |
| NOT_FOUND | 404 | Resource not found |
| ALREADY_PROCESSING | 409 | Session is already being processed |
| COLLECTION_ERROR | 500 | Failed to collect data |
| FETCH_ERROR | 500 | Failed to fetch data |
| LIST_ERROR | 500 | Failed to list resources |
| INTERNAL_ERROR | 500 | Unexpected server error |

### Error Handling Examples

**Node.js (fetch):**
```javascript
try {
  const response = await fetch('http://localhost:3000/api/sessions/123/collect', {
    method: 'POST'
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${error.code}: ${error.error}`);
    
    if (error.code === 'ALREADY_PROCESSING') {
      console.log('Session is already being processed. Please wait.');
    }
  } else {
    const result = await response.json();
    console.log('Collection successful:', result);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

**Python (requests):**
```python
import requests

try:
    response = requests.post('http://localhost:3000/api/sessions/123/collect')
    
    if response.status_code == 200:
        result = response.json()
        print('Collection successful:', result)
    elif response.status_code == 409:
        error = response.json()
        print('Session is already being processed. Please wait.')
    else:
        error = response.json()
        print(f"Error {error['code']}: {error['error']}")
except requests.exceptions.RequestException as e:
    print('Network error:', e)
```

---

## Rate Limiting

Currently, the API does not enforce rate limiting. However, please be considerate and avoid making excessive requests to the API. Rate limiting may be implemented in future versions.

---

## Complete Usage Examples

### Example 1: Get session and trigger collection if needed

**Node.js:**
```javascript
async function ensureSessionCollected(sessionId) {
  // Get session details
  const sessionResponse = await fetch(`http://localhost:3000/api/sessions/${sessionId}`);
  
  if (!sessionResponse.ok) {
    throw new Error(`Session ${sessionId} not found`);
  }
  
  const session = await sessionResponse.json();
  
  // If not collected, trigger collection
  if (session.detalhesColetados === 'NAO_COLETADO' || session.detalhesColetados === 'ERRO') {
    console.log(`Triggering collection for session ${sessionId}...`);
    
    const collectResponse = await fetch(
      `http://localhost:3000/api/sessions/${sessionId}/collect`,
      { method: 'POST' }
    );
    
    if (!collectResponse.ok) {
      const error = await collectResponse.json();
      console.error(`Collection failed: ${error.error}`);
      return session;
    }
    
    const result = await collectResponse.json();
    console.log('Collection completed!');
    return result.session;
  }
  
  console.log(`Session ${sessionId} already collected`);
  return session;
}

// Usage
await ensureSessionCollected(123);
```

**Python:**
```python
import requests

def ensure_session_collected(session_id):
    # Get session details
    response = requests.get(f'http://localhost:3000/api/sessions/{session_id}')
    
    if response.status_code != 200:
        raise Exception(f'Session {session_id} not found')
    
    session = response.json()
    
    # If not collected, trigger collection
    if session['detalhesColetados'] in ['NAO_COLETADO', 'ERRO']:
        print(f'Triggering collection for session {session_id}...')
        
        collect_response = requests.post(
            f'http://localhost:3000/api/sessions/{session_id}/collect'
        )
        
        if collect_response.status_code != 200:
            error = collect_response.json()
            print(f"Collection failed: {error['error']}")
            return session
        
        result = collect_response.json()
        print('Collection completed!')
        return result['session']
    
    print(f'Session {session_id} already collected')
    return session

# Usage
session = ensure_session_collected(123)
```

### Example 2: Export all sessions to CSV

**Python:**
```python
import requests
import csv

def export_all_sessions_to_csv(filename='sessions.csv'):
    all_sessions = []
    page = 1
    
    # Get all sessions
    while True:
        response = requests.get('http://localhost:3000/api/sessions', params={
            'page': page,
            'limit': 100
        })
        data = response.json()
        
        all_sessions.extend(data['sessions'])
        
        if page >= data['pagination']['totalPages']:
            break
        
        page += 1
    
    # Write to CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'title', 'type', 'openingDate', 'legislature', 
                      'legislativeSession', 'url', 'detalhesColetados', 'scrapedAt']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for session in all_sessions:
            writer.writerow(session)
    
    print(f'Exported {len(all_sessions)} sessions to {filename}')

# Usage
export_all_sessions_to_csv()
```

---

## Troubleshooting

### Server won't start

**Problem:** Error when running `npm run api:dev`

**Solution:** 
1. Check if another process is using port 3000
2. Set a different port: `PORT=3001 npm run api:dev`
3. Verify environment variables are set in `.env`

### Connection errors

**Problem:** `ECONNREFUSED` or connection timeout

**Solutions:**
1. Verify the server is running
2. Check if you're using the correct URL and port
3. Verify firewall settings

### Authentication errors with Supabase

**Problem:** API returns 500 errors related to database

**Solutions:**
1. Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
2. Check Supabase project status
3. Verify database tables are created

---

## Version History

- **v0.1.0** (2025-12-30): Initial API release
  - Basic CRUD operations for sessions
  - On-demand data collection
  - Pagination support

---

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/huandrey/camara-radar/issues)
- Related to Issue #5

---

## License

MIT License - see LICENSE file for details
