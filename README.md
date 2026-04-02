# n8n-nodes-polymesh

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Polymesh blockchain platform, offering 6 resources for managing digital assets, identities, portfolios, transactions, compliance rules, and trading venues. Enable automated workflows for institutional-grade security token management and regulatory compliance on the Polymesh network.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Blockchain](https://img.shields.io/badge/blockchain-Polymesh-purple)
![Security Tokens](https://img.shields.io/badge/tokens-Security%20Tokens-green)
![Compliance](https://img.shields.io/badge/compliance-Institutional-orange)

## Features

- **Asset Management** - Create, configure, and manage security tokens with built-in compliance
- **Identity Operations** - Handle investor identities, KYC status, and regulatory attestations
- **Portfolio Control** - Manage custodial portfolios and asset holdings across identities
- **Transaction Monitoring** - Track, validate, and execute compliant blockchain transactions
- **Compliance Automation** - Configure and enforce transfer restrictions and regulatory rules
- **Venue Operations** - Manage trading venues, settlements, and institutional exchange activities
- **Regulatory Support** - Built-in compliance frameworks for global securities regulations
- **Enterprise Security** - Institutional-grade security with permissioned blockchain architecture

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
| API Key | Polymesh network API key for authentication | Yes |
| Network Environment | Target network (mainnet/testnet) | Yes |
| Node URL | Custom Polymesh node endpoint (optional) | No |

## Resources & Operations

### 1. Asset

| Operation | Description |
|-----------|-------------|
| Create | Create a new security token on Polymesh |
| Get Details | Retrieve asset information and metadata |
| Update Metadata | Modify asset documentation and details |
| Freeze/Unfreeze | Control asset transfer capabilities |
| Issue Tokens | Mint new tokens to specified identities |
| Redeem Tokens | Burn tokens from circulation |
| List Holdings | Get all holders and their balances |
| Set Compliance Rules | Configure transfer restrictions |

### 2. Identity

| Operation | Description |
|-----------|-------------|
| Create | Register a new identity on Polymesh |
| Get Profile | Retrieve identity information and status |
| Add Claim | Attach regulatory attestations or KYC data |
| Remove Claim | Revoke existing claims or attestations |
| List Claims | View all claims associated with identity |
| Update Profile | Modify identity metadata and information |
| Authorize Key | Grant permissions to signing keys |
| Revoke Key | Remove key authorization |

### 3. Portfolio

| Operation | Description |
|-----------|-------------|
| Create | Create a new custodial portfolio |
| Get Details | Retrieve portfolio information and holdings |
| Transfer Assets | Move assets between portfolios |
| List Holdings | View all assets in portfolio |
| Set Permissions | Configure access controls |
| Delete Portfolio | Remove empty portfolio |
| Get Transactions | Retrieve portfolio transaction history |
| Update Metadata | Modify portfolio information |

### 4. Transaction

| Operation | Description |
|-----------|-------------|
| Submit | Execute a transaction on Polymesh |
| Get Status | Check transaction confirmation status |
| Get Details | Retrieve complete transaction information |
| List History | Get transaction history for identity/asset |
| Estimate Fees | Calculate transaction costs |
| Batch Execute | Submit multiple transactions together |
| Cancel Pending | Cancel unconfirmed transactions |
| Validate | Pre-validate transaction compliance |

### 5. Compliance

| Operation | Description |
|-----------|-------------|
| Create Rule | Define new transfer restriction rules |
| Get Rules | Retrieve compliance rules for asset |
| Update Rule | Modify existing compliance requirements |
| Delete Rule | Remove compliance restrictions |
| Check Compliance | Validate if transfer meets requirements |
| List Exemptions | View compliance exemptions |
| Add Exemption | Grant compliance bypass for identity |
| Remove Exemption | Revoke compliance exemption |

### 6. Venue

| Operation | Description |
|-----------|-------------|
| Create | Establish a new trading venue |
| Get Details | Retrieve venue information and status |
| Add Instruction | Create settlement instruction |
| Execute Settlement | Process venue settlements |
| List Instructions | View all venue instructions |
| Update Venue | Modify venue configuration |
| Authorize Parties | Grant venue access permissions |
| Get Statistics | Retrieve venue trading metrics |

## Usage Examples

```javascript
// Create a new security token
{
  "ticker": "ACME",
  "assetName": "ACME Corp Security Token",
  "totalSupply": "1000000",
  "divisible": true,
  "assetType": "EquityCommon",
  "identifiers": [
    {
      "type": "ISIN",
      "value": "US0123456789"
    }
  ]
}
```

```javascript
// Register investor identity with KYC claim
{
  "did": "0x1234567890abcdef",
  "primaryKey": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "claims": [
    {
      "type": "Accredited",
      "jurisdiction": "US",
      "expiry": "2024-12-31"
    }
  ]
}
```

```javascript
// Execute compliant token transfer
{
  "from": "0xsender123",
  "to": "0xreceiver456", 
  "asset": "ACME",
  "amount": "1000",
  "memo": "Quarterly distribution",
  "validateCompliance": true
}
```

```javascript
// Set up compliance rule for accredited investors
{
  "asset": "ACME",
  "ruleType": "Identity",
  "requirements": [
    {
      "claimType": "Accredited",
      "jurisdiction": "US",
      "required": true
    }
  ],
  "exemptions": ["0xexemptIdentity789"]
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| InvalidApiKey | API authentication failed | Verify API key and network settings |
| InsufficientBalance | Not enough tokens for operation | Check account balance before transfer |
| ComplianceViolation | Transfer blocked by compliance rules | Review and satisfy compliance requirements |
| IdentityNotFound | Referenced identity does not exist | Verify identity DID or create identity first |
| AssetNotFound | Referenced asset ticker not found | Check asset ticker spelling and existence |
| UnauthorizedOperation | Insufficient permissions for action | Ensure proper key authorization and permissions |

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
- **Polymesh Documentation**: [docs.polymesh.network](https://docs.polymesh.network)
- **Developer Resources**: [developers.polymesh.network](https://developers.polymesh.network)