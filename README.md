# n8n-nodes-polymesh

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node package for interacting with the **Polymesh blockchain** - an institutional-grade, permissioned blockchain purpose-built for regulated assets and security tokens.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Polymesh](https://img.shields.io/badge/blockchain-Polymesh-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **18 Resource Types** covering all Polymesh functionality
- **150+ Operations** for complete blockchain interaction
- **Real-time Triggers** for event-driven workflows
- **Full TypeScript Support** with proper type definitions
- **Comprehensive Error Handling** with descriptive messages
- **Identity Management** with CDD (Customer Due Diligence) support
- **Compliance Framework** for regulated asset transfers
- **Settlement Engine** with T+0 atomic settlement

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter: `n8n-nodes-polymesh`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-polymesh

# Restart n8n
n8n start
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-polymesh.zip
cd n8n-nodes-polymesh

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-polymesh

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-polymesh %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### Polymesh Network Credentials

| Field | Description |
|-------|-------------|
| Network | Mainnet, Testnet, Staging, Local, or Custom |
| WebSocket URL | WSS endpoint (auto-filled for standard networks) |
| Seed Phrase | 12-word mnemonic for signing transactions |
| Key Type | sr25519 (default) or ed25519 |
| Derivation Path | Optional HD derivation path |
| Middleware URL | Optional SubQuery GraphQL endpoint |
| Middleware API Key | Optional API key for middleware |

### Polymesh Middleware Credentials (Optional)

| Field | Description |
|-------|-------------|
| Middleware URL | GraphQL endpoint URL |
| API Key | Authentication key (if required) |

### CDD Provider Credentials (Optional)

| Field | Description |
|-------|-------------|
| Provider ID | CDD provider identifier |
| API Endpoint | Provider API URL |
| API Key | Authentication credentials |

## Resources & Operations

### Identity (CDD)
Manage Polymesh identities and Customer Due Diligence:
- Get Identity / Get My Identity
- Get Identity Claims / Assets / Portfolios / Venues
- Add/Remove Secondary Keys
- Freeze/Unfreeze Secondary Keys
- Rotate Primary Key
- Get Trusted Claim Issuers

### Account
POLYX balance and account management:
- Get Account Balance
- Get Account Identity
- Transfer POLYX
- Get Transaction History
- Accept/Reject Authorizations
- Validate Address

### Asset (Security Tokens)
Create and manage security tokens:
- Create Asset
- Issue/Redeem Tokens
- Get Asset Details / Documents / Compliance / Holders
- Freeze/Unfreeze Asset
- Add/Remove Documents
- Controller Transfer
- Manage Metadata & Identifiers

### Compliance
Configure transfer compliance rules:
- Get/Add/Remove Compliance Requirements
- Pause/Resume Compliance
- Manage Trusted Claim Issuers
- Validate Transfer Compliance

### Claims
Manage identity claims and attestations:
- Get Claims (by type: CDD, Accredited, Jurisdiction, etc.)
- Add/Revoke Claims
- Get Claim Scopes
- Refresh CDD Claim

### Settlement
Create and execute settlement instructions:
- Create Venue
- Add Instruction
- Affirm/Reject/Execute Instructions
- Get Pending/Affirmed Instructions
- Withdraw Affirmation

### Portfolio
Manage asset portfolios:
- Create/Delete/Rename Portfolio
- Get Portfolio Assets
- Move Assets Between Portfolios
- Manage Custody

### Corporate Actions
Dividends, ballots, and distributions:
- Create Dividend Distribution
- Push/Claim/Reclaim Dividends
- Create Checkpoints
- Get Distribution Targets

### STO (Security Token Offering)
Manage fundraising:
- Create Fundraiser
- Modify Fundraiser Times
- Freeze/Unfreeze/Close Fundraiser
- Invest in Fundraiser

### Statistics
Asset statistics and transfer restrictions:
- Get/Set Transfer Restrictions
- Get Investor Count
- Manage Exempted Entities

### Confidential Assets
Privacy-preserving transfers:
- Create Confidential Asset/Account
- Get Confidential Balance
- Create/Affirm Confidential Transaction

### Multi-Sig
Multi-signature accounts:
- Create Multi-Sig Account
- Get/Approve/Reject Proposals
- Manage Signers

### Authorizations
Pending authorization management:
- Get Pending/Sent Authorizations
- Accept/Reject Authorization

### Governance (PIPs)
Polymesh Improvement Proposals:
- Get Active PIPs
- Get PIP Details
- Get Committee Members

### Checkpoint
Balance snapshots:
- Create Checkpoint
- Create/Remove Schedules
- Get Holders/Balances at Checkpoint

### External Agents
Delegated asset permissions:
- Add/Remove External Agents
- Create Custom Permission Groups

### NFT
Non-fungible security tokens:
- Create NFT Collection
- Issue/Redeem NFT
- Get NFT Details

### Utility
Helper functions:
- Convert Units (POLYX has 6 decimals)
- Encode/Decode Address (SS58)
- Validate DID/Address
- Get Network Info

## Trigger Node

The **Polymesh Trigger** node enables real-time event-driven workflows:

### Event Categories
- **Identity Events**: DID created, secondary key added/removed
- **Asset Events**: Asset created, issued, transferred, frozen
- **Settlement Events**: Instruction created, affirmed, executed
- **Compliance Events**: Compliance rules changed
- **Corporate Action Events**: Dividend distributed, checkpoint created

### Configuration
| Field | Description |
|-------|-------------|
| Event Category | Category of events to monitor |
| Event Type | Specific event type within category |
| Filter Options | Optional filters (ticker, DID, etc.) |

## Usage Examples

### Example 1: Get Identity Claims

```json
{
  "nodes": [
    {
      "name": "Polymesh",
      "type": "n8n-nodes-polymesh.polymesh",
      "parameters": {
        "resource": "identity",
        "operation": "getIdentityClaims",
        "did": "0x0600000000000000000000000000000000000000000000000000000000000000"
      }
    }
  ]
}
```

### Example 2: Create Security Token

```json
{
  "nodes": [
    {
      "name": "Polymesh",
      "type": "n8n-nodes-polymesh.polymesh",
      "parameters": {
        "resource": "asset",
        "operation": "createAsset",
        "name": "Acme Corp Stock",
        "ticker": "ACME",
        "assetType": "EquityCommon",
        "isDivisible": true,
        "initialSupply": "1000000"
      }
    }
  ]
}
```

### Example 3: Transfer POLYX

```json
{
  "nodes": [
    {
      "name": "Polymesh",
      "type": "n8n-nodes-polymesh.polymesh",
      "parameters": {
        "resource": "account",
        "operation": "transferPolyx",
        "recipient": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount": "100",
        "memo": "Payment for services"
      }
    }
  ]
}
```

### Example 4: Create Settlement Instruction

```json
{
  "nodes": [
    {
      "name": "Polymesh",
      "type": "n8n-nodes-polymesh.polymesh",
      "parameters": {
        "resource": "settlement",
        "operation": "addInstruction",
        "venueId": "1",
        "legs": [
          {
            "from": "0x0600...",
            "to": "0x0700...",
            "asset": "ACME",
            "amount": "1000"
          }
        ]
      }
    }
  ]
}
```

### Example 5: Real-Time Event Trigger

```json
{
  "nodes": [
    {
      "name": "Polymesh Trigger",
      "type": "n8n-nodes-polymesh.polymeshTrigger",
      "parameters": {
        "eventCategory": "settlement",
        "eventType": "InstructionExecuted",
        "filterOptions": {
          "ticker": "ACME"
        }
      }
    }
  ]
}
```

## Polymesh Concepts

### DID (Decentralized Identifier)
Every participant on Polymesh has a unique identity represented by a DID (64 hex characters prefixed with 0x). DIDs are the foundation for compliance and governance.

### CDD (Customer Due Diligence)
All Polymesh participants must complete KYC verification through an approved CDD provider before transacting. CDD claims have expiration dates and must be refreshed.

### POLYX
The native token of Polymesh, used for transaction fees. POLYX has 6 decimal places.

### Claims
Verified attestations about identities. Types include:
- CustomerDueDiligence (CDD)
- Accredited
- Affiliate
- Jurisdiction
- KYC
- Custom claims

### Compliance
Protocol-level transfer rules enforced at settlement. Each asset can have compliance requirements based on claims held by sender and receiver.

### Settlement
Polymesh features atomic T+0 settlement with multi-party affirmation. Instructions are created in venues and must be affirmed by all parties before execution.

### Portfolios
Assets within an identity can be segregated into numbered portfolios. Each identity has a default portfolio and can create additional portfolios.

### Checkpoints
Point-in-time balance snapshots for corporate actions. Checkpoints can be created manually or on a schedule.

## Networks

| Network | WebSocket URL | Chain ID |
|---------|---------------|----------|
| Mainnet | wss://mainnet-rpc.polymesh.network | polymesh_mainnet |
| Testnet | wss://testnet-rpc.polymesh.live | polymesh_testnet |
| Staging | wss://staging-rpc.polymesh.live | polymesh_staging |

## Error Handling

The node provides detailed error messages for common issues:

- **Invalid DID**: Check that the DID is 64 hex characters prefixed with 0x
- **No CDD Claim**: The identity lacks a valid Customer Due Diligence claim
- **Compliance Failure**: Transfer blocked due to compliance rule violation
- **Insufficient Balance**: Not enough POLYX or tokens for the operation
- **Authorization Required**: The operation requires pending authorization acceptance

## Security Best Practices

1. **Never share seed phrases** - Store securely using n8n credentials
2. **Use testnet for development** - Avoid mainnet until workflows are tested
3. **Validate DIDs** - Always verify DID format before operations
4. **Check CDD claims** - Ensure identities have valid CDD before transfers
5. **Monitor compliance** - Review compliance rules before asset transfers

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Format code
npm run format
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please submit pull requests to the GitHub repository.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- [Polymesh Documentation](https://developers.polymesh.network/)
- [Polymesh SDK](https://github.com/PolymeshAssociation/polymesh-sdk)
- [n8n Community](https://community.n8n.io/)
- [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-polymesh/issues)

## Acknowledgments

- [Polymesh Association](https://polymesh.network/) for the blockchain platform
- [n8n](https://n8n.io/) for the workflow automation platform
- The Substrate and Polkadot ecosystem

## Changelog

### 1.0.0
- Initial release
- 18 resource types with 150+ operations
- Real-time event triggers
- Full TypeScript support
