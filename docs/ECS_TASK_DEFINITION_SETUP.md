# ECS Task Definition - Complete Setup Guide

## Step 1: Create Task Definition
1. AWS Console → ECS → **"Task definitions"**
2. Click **"Create new task definition"**

## Step 2: Basic Configuration

**Task definition configuration:**
- **Task definition family:** `crud-ai-task`
- **Launch type:** `AWS Fargate`
- **Operating system/Architecture:** `Linux/X86_64`

**Task size:**
- **CPU:** `0.5 vCPU` (or 1 vCPU if available)
- **Memory:** `1 GB` (or 2 GB)

**Task role:** Leave empty (can add later)
**Task execution role:** Use default

---

## Step 3: Container 1 - Server

Click **"Add container"**

**Container details:**
- **Container name:** `crud-ai-server`
- **Image:** `169615918551.dkr.ecr.eu-north-1.amazonaws.com/curd_ai_app:server-latest`

**Port mappings:**
- **Container port:** `8000`
- **Protocol:** `TCP`
- **Port name:** Leave empty
- **App protocol:** Leave empty

**Environment variables:**
Add these 5 variables (click "Add environment variable" for each):

1. **Key:** `AUTH0_DOMAIN` | **Value type:** `Value` | **Value:** `dev-f7ttgvlvcizan1uj.eu.auth0.com`
2. **Key:** `AUTH0_API_AUDIENCE` | **Value type:** `Value` | **Value:** `https://crudai-api`
3. **Key:** `AUTH0_ISSUER` | **Value type:** `Value` | **Value:** `https://dev-f7ttgvlvcizan1uj.eu.auth0.com/`
4. **Key:** `AUTH0_ALGORITHMS` | **Value type:** `Value` | **Value:** `RS256`
5. **Key:** `DATABASE_URL` | **Value type:** `Value` | **Value:** `sqlite:///./crudai.db`

**Health check (optional):**
- **Command:** `CMD-SHELL,curl -f http://localhost:8000/ || exit 1`

**SKIP these sections:**
- Storage and logging
- Security
- Resource requirements
- Docker configuration

Click **"Add"** to save server container.

---

## Step 4: Container 2 - Client

Click **"Add container"** again

**Container details:**
- **Container name:** `crud-ai-client`
- **Image:** `169615918551.dkr.ecr.eu-north-1.amazonaws.com/curd_ai_app:client-latest`

**Port mappings:**
- **Container port:** `80`
- **Protocol:** `TCP`

**Environment variables:**
Add these 4 variables:

1. **Key:** `VITE_AUTH0_DOMAIN` | **Value type:** `Value` | **Value:** `dev-f7ttgvlvcizan1uj.eu.auth0.com`
2. **Key:** `VITE_AUTH0_CLIENT_ID` | **Value type:** `Value` | **Value:** `9iOqeGnNm6S1dBCCTYRwXVjIOm1hvmCv`
3. **Key:** `VITE_AUTH0_AUDIENCE` | **Value type:** `Value` | **Value:** `https://crudai-api`
4. **Key:** `VITE_AUTH0_REDIRECT_URI` | **Value type:** `Value` | **Value:** `http://localhost:5173`

**Container dependencies (important):**
- **Container name:** `crud-ai-server`
- **Condition:** `START`

**Health check (optional):**
- **Command:** `CMD-SHELL,wget --no-verbose --tries=1 --spider http://localhost/ || exit 1`

**SKIP these sections:**
- Storage and logging
- Security
- Resource requirements
- Docker configuration

Click **"Add"** to save client container.

---

## Step 5: Finalize Task Definition

**SKIP these sections at the bottom:**
- Volumes
- Tags
- Log router configuration

Click **"Create"** to create the task definition.

---

## Ready to copy-paste values:

### Server Environment Variables:
```
AUTH0_DOMAIN = dev-f7ttgvlvcizan1uj.eu.auth0.com
AUTH0_API_AUDIENCE = https://crudai-api
AUTH0_ISSUER = https://dev-f7ttgvlvcizan1uj.eu.auth0.com/
AUTH0_ALGORITHMS = RS256
DATABASE_URL = sqlite:///./crudai.db
```

### Client Environment Variables:
```
VITE_AUTH0_DOMAIN = dev-f7ttgvlvcizan1uj.eu.auth0.com
VITE_AUTH0_CLIENT_ID = 9iOqeGnNm6S1dBCCTYRwXVjIOm1hvmCv
VITE_AUTH0_AUDIENCE = https://crudai-api
VITE_AUTH0_REDIRECT_URI = http://localhost:5173
```

### Image URIs:
```
Server: 169615918551.dkr.ecr.eu-north-1.amazonaws.com/curd_ai_app:server-latest
Client: 169615918551.dkr.ecr.eu-north-1.amazonaws.com/curd_ai_app:client-latest
```

---

## Next Steps After Task Definition Creation:

1. **Create ECS Service:**
   - Go to ECS → Services
   - Click "Create Service"
   - Select your cluster: `crud-ai-cluster`
   - Select task definition: `crud-ai-task`
   - Service name: `crud-ai-service`
   - Desired tasks: `1`

2. **Configure Load Balancer (Optional):**
   - For production, add Application Load Balancer
   - Configure target groups for ports 80 and 8000

3. **Test Deployment:**
   - Check service status in ECS console
   - Verify tasks are running
   - Test endpoints via public IP
