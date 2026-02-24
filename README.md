# n8n-nodes-polymesh

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for Polymesh, the institutional-grade blockchain for regulated assets. This node provides 8 comprehensive resources enabling seamless integration with Polymesh's identity management, asset tokenization, portfolio management, and settlement infrastructure for compliant digital securities workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Polymesh](https://img.shields.io/badge/Polymesh-Compatible-green)
![Blockchain](https://img.shields.io/badge/Blockchain-Enterprise-orange)
![Security Tokens](https://img.shields.io/badge/Security%20Tokens-Compliant-purple)

## Features

- **Identity Management** - Create, verify, and manage on-chain identities with KYC/AML compliance
- **Asset Tokenization** - Issue, transfer, and manage security tokens with built-in compliance rules
- **Portfolio Operations** - Handle multi-asset portfolios with granular permission controls
- **Settlement Engine** - Execute atomic settlements with automated compliance verification
- **Instruction Processing** - Create and manage complex multi-party transaction instructions
- **Claims Framework** - Issue and verify regulatory claims for investor accreditation
- **Block Explorer** - Query blockchain data, transactions, and historical records
- **Transaction Management** - Submit, track, and validate on-chain transactions

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-polymesh`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-polymesh
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-polymesh.git
cd n8n-nodes-polymesh
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-polymesh
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Polymesh REST API authentication key | Yes |
| Network | Polymesh network (mainnet, testnet) | Yes |
| Signing Account | Account address for transaction signing | Yes |
| Base URL | Custom API endpoint URL (optional) | No |

## Resources & Operations

### 1. Identities

| Operation | Description |
|-----------|-------------|
| Create | Register a new on-chain identity |
| Get | Retrieve identity details and verification status |
| Update | Modify identity attributes and metadata |
| List | Get all identities with filtering options |
| Verify | Perform identity verification checks |
| Get Claims | Retrieve all claims associated with an identity |
| Add Secondary Keys | Add secondary signing keys to identity |
| Remove Secondary Keys | Remove secondary keys from identity |

### 2. Assets

| Operation | Description |
|-----------|-------------|
| Create | Issue a new security token with compliance rules |
| Get | Retrieve asset details, supply, and metadata |
| Update | Modify asset properties and compliance settings |
| List | Get all assets with filtering and pagination |
| Transfer | Execute compliant asset transfers |
| Freeze | Freeze asset transfers for compliance |
| Unfreeze | Unfreeze previously frozen assets |
| Get Holders | Retrieve all current asset holders |
| Get Transactions | Get asset transaction history |

### 3. Portfolios

| Operation | Description |
|-----------|-------------|
| Create | Create new portfolio for asset management |
| Get | Retrieve portfolio details and holdings |
| Update | Modify portfolio settings and permissions |
| List | Get all portfolios for an identity |
| Get Holdings | Retrieve all asset holdings in portfolio |
| Move Assets | Move assets between portfolios |
| Grant Custody | Grant custody permissions to other identities |
| Revoke Custody | Revoke previously granted custody permissions |

### 4. Settlements

| Operation | Description |
|-----------|-------------|
| Create | Initiate new settlement between parties |
| Get | Retrieve settlement details and status |
| List | Get all settlements with filtering options |
| Execute | Execute pending settlement transactions |
| Reject | Reject pending settlement proposals |
| Get Legs | Retrieve all legs of a settlement |
| Add Instruction | Add new instruction to settlement |
| Cancel | Cancel pending settlement |

### 5. Instructions

| Operation | Description |
|-----------|-------------|
| Create | Create new transaction instruction |
| Get | Retrieve instruction details and status |
| List | Get all instructions with filtering |
| Execute | Execute pending instruction |
| Reject | Reject instruction proposal |
| Update | Modify instruction parameters |
| Get Affirms | Retrieve affirmation status from all parties |
| Withdraw | Withdraw previously created instruction |

### 6. Claims

| Operation | Description |
|-----------|-------------|
| Create | Issue new regulatory or investor claim |
| Get | Retrieve claim details and verification status |
| List | Get all claims with filtering options |
| Verify | Verify claim authenticity and validity |
| Revoke | Revoke previously issued claim |
| Get by Identity | Retrieve all claims for specific identity |
| Get by Scope | Get claims within specific regulatory scope |
| Update | Modify existing claim parameters |

### 7. Blocks

| Operation | Description |
|-----------|-------------|
| Get Latest | Retrieve latest block information |
| Get by Number | Get specific block by block number |
| Get by Hash | Retrieve block by its hash |
| List | Get multiple blocks with pagination |
| Get Transactions | Retrieve all transactions in a block |
| Get Events | Get all events emitted in a block |
| Search | Search blocks by various criteria |

### 8. Transactions

| Operation | Description |
|-----------|-------------|
| Create | Create new transaction for submission |
| Get | Retrieve transaction details and status |
| List | Get transactions with filtering options |
| Submit | Submit transaction to blockchain |
| Get Receipt | Retrieve transaction execution receipt |
| Get Events | Get events emitted by transaction |
| Estimate Fee | Estimate transaction fees before submission |
| Get by Block | Retrieve all transactions in a block |

## Usage Examples

```javascript
// Create a new identity with KYC verification
{
  "node": "Polymesh",
  "resource": "Identities",
  "operation": "Create",
  "parameters": {
    "did": "0x01000000000000000000000000000000000000000000000000000000000000",
    "primaryKey": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "secondaryKeys": [],
    "metadata": {
      "investorType": "institutional",
      "jurisdiction": "US"
    }
  }
}
```

```javascript
// Issue a new security token
{
  "node": "Polymesh",
  "resource": "Assets",
  "operation": "Create",
  "parameters": {
    "name": "ACME Corp Preferred Shares",
    "ticker": "ACME-A",
    "totalSupply": "1000000",
    "divisible": true,
    "assetType": "EquityPreferred",
    "identifiers": [
      {
        "type": "ISIN",
        "value": "US00123456789"
      }
    ]
  }
}
```

```javascript
// Execute compliant asset transfer
{
  "node": "Polymesh",
  "resource": "Assets",
  "operation": "Transfer",
  "parameters": {
    "ticker": "ACME-A",
    "from": "0x01000000000000000000000000000000000000000000000000000000000001",
    "to": "0x01000000000000000000000000000000000000000000000000000000000002",
    "amount": "5000",
    "memo": "Private placement transfer"
  }
}
```

```javascript
// Create atomic settlement between multiple parties
{
  "node": "Polymesh",
  "resource": "Settlements",
  "operation": "Create",
  "parameters": {
    "venueId": "1",
    "legs": [
      {
        "from": "0x01000000000000000000000000000000000000000000000000000000000001",
        "to": "0x01000000000000000000000000000000000000000000000000000000000002",
        "ticker": "ACME-A",
        "amount": "1000"
      },
      {
        "from": "0x01000000000000000000000000000000000000000000000000000000000002",
        "to": "0x01000000000000000000000000000000000000000000000000000000000001",
        "ticker": "POLYX",
        "amount": "50000"
      }
    ]
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid DID Format | Provided Distributed Identity (DID) format is incorrect | Ensure DID follows Polymesh format: 32-byte hex string |
| Insufficient Balance | Account lacks sufficient tokens for transaction | Check account balance and ensure adequate POLYX for fees |
| Compliance Violation | Transfer blocked by compliance rules | Verify investor claims and asset transfer restrictions |
| Identity Not Found | Specified identity does not exist on chain | Verify identity exists and DID is correct |
| Unauthorized Operation | Account lacks permission for requested operation | Ensure account has required permissions or asset custody |
| Network Connection Failed | Unable to connect to Polymesh network | Check network settings and API endpoint availability |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-polymesh/issues)
- **Polymesh Documentation**: [Polymesh Developer Portal](https://developers.polymesh.network/)
- **Polymesh Community**: [Polymesh Discord](https://discord.gg/polymesh)