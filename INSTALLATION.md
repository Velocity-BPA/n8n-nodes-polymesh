# n8n-nodes-polymesh Installation & Deployment Guide

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

## Package Overview

**n8n-nodes-polymesh** is a complete community node package for the Polymesh blockchain with:
- 18 resource types (Identity, Account, Asset, Compliance, Claims, Settlement, Portfolio, Corporate Actions, STO, Statistics, Confidential Assets, Multi-Sig, Authorizations, Governance, Checkpoint, External Agents, NFT, Utility)
- 150+ operations
- Real-time event triggers
- Full TypeScript implementation

---

## Step 1: Extract the Package

```bash
# Extract the zip file
unzip n8n-nodes-polymesh.zip
cd n8n-nodes-polymesh
```

---

## Step 2: Install Dependencies & Build (if not pre-built)

```bash
# Install dependencies
npm install

# Build the package
npm run build
```

---

## Step 3: Install to Local n8n Instance

### Option A: Link for Development (Recommended for Testing)

```bash
# From the n8n-nodes-polymesh directory
npm link

# Navigate to your n8n installation's custom nodes directory
# For global n8n installation:
cd ~/.n8n/custom
# OR for Docker: mount the volume appropriately

# Link the package
npm link n8n-nodes-polymesh

# Restart n8n
n8n restart
# OR if running as a service:
sudo systemctl restart n8n
```

### Option B: Copy Directly to Custom Nodes

```bash
# Copy the built package to n8n custom nodes
cp -r /path/to/n8n-nodes-polymesh ~/.n8n/custom/

# Restart n8n
n8n restart
```

### Option C: Install from npm (After Publishing)

```bash
cd ~/.n8n/custom
npm install n8n-nodes-polymesh
```

---

## Step 4: Verify Installation

1. Start n8n: `n8n start`
2. Open n8n in your browser (default: http://localhost:5678)
3. Create a new workflow
4. Search for "Polymesh" in the node panel
5. You should see:
   - **Polymesh** (action node)
   - **Polymesh Trigger** (trigger node)

---

## Step 5: Configure Credentials

### Polymesh Network Credentials

1. Click on the Polymesh node
2. Click "Create New" under Credentials
3. Fill in:
   - **Network**: Select Mainnet, Testnet, Staging, Local, or Custom
   - **Seed Phrase**: Your 12-word mnemonic (for signing transactions)
   - **Key Type**: sr25519 (default) or ed25519
   - **Middleware URL** (optional): SubQuery GraphQL endpoint
   - **Custom WSS URL** (if using Custom network)

### Test Credentials on Testnet

For testing, use Polymesh Testnet:
- Network: `Testnet`
- Get testnet POLYX from the [Polymesh Faucet](https://testnet-faucet.polymesh.network/)

---

## Step 6: Test the Node

### Simple Test Workflow

1. Add a "Polymesh" node
2. Configure credentials (testnet recommended)
3. Set:
   - Resource: `Utility`
   - Operation: `Get Network Information`
4. Execute the node
5. Verify you receive network info (name, version, latest block)

### Test Identity Operations

1. Add a "Polymesh" node
2. Set:
   - Resource: `Identity`
   - Operation: `Get My Identity`
3. Execute
4. Verify your DID is returned (if identity exists)

---

## npm Publishing

### Step 1: Prepare for npm

1. Update `package.json`:
   ```json
   {
     "name": "n8n-nodes-polymesh",
     "version": "1.0.0",
     "homepage": "https://github.com/Velocity-BPA/n8n-nodes-polymesh"
   }
   ```

2. Ensure you're logged in to npm:
   ```bash
   npm login
   ```

### Step 2: Publish

```bash
npm publish
```

### Step 3: Verify on npm

Visit: https://www.npmjs.com/package/n8n-nodes-polymesh

---

## Troubleshooting

### Node Not Appearing

1. Check n8n logs for errors
2. Verify the package is in `~/.n8n/custom/node_modules/`
3. Restart n8n completely

### Connection Errors

1. Verify network URL is correct
2. Check if seed phrase is valid
3. Ensure you have POLYX for transaction fees

### TypeScript Errors During Build

1. Clear node_modules: `rm -rf node_modules`
2. Reinstall: `npm install`
3. Rebuild: `npm run build`

---

## Package Structure

```
n8n-nodes-polymesh/
├── credentials/                    # Credential definitions
│   ├── PolymeshNetwork.credentials.ts
│   ├── PolymeshMiddleware.credentials.ts
│   └── CddProvider.credentials.ts
├── nodes/
│   └── Polymesh/
│       ├── Polymesh.node.ts       # Main action node
│       ├── PolymeshTrigger.node.ts # Trigger node
│       ├── polymesh.svg           # Node icon
│       ├── actions/               # Resource operations
│       │   ├── identity/
│       │   ├── account/
│       │   ├── asset/
│       │   └── ... (18 resources)
│       ├── transport/             # SDK clients
│       │   ├── polymeshClient.ts
│       │   ├── middlewareClient.ts
│       │   └── subscriptionClient.ts
│       ├── constants/             # Type definitions
│       └── utils/                 # Helper functions
├── dist/                          # Compiled output
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE                        # BSL 1.1
├── COMMERCIAL_LICENSE.md
└── LICENSING_FAQ.md
```

---

## Support

- [Polymesh Documentation](https://developers.polymesh.network/)
- [n8n Community](https://community.n8n.io/)
- [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-polymesh/issues)

---

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)
