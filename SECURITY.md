# Security Policy

[Read the Turkish security policy](SECURITY.tr.md)

## Supported versions

olnk.tr is under active development and does not yet publish long-term support releases.

| Version | Supported |
| --- | --- |
| Current production deployment | Yes |
| Latest `main` branch | Yes |
| Older commits, forks, and third-party deployments | No |

Security fixes are applied to the active codebase. Maintainers may change this policy when versioned releases are introduced.

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue, discussion, pull request, social media post, or other public channel.

Use [GitHub private vulnerability reporting](https://github.com/MRsuffixx/OlnkTR/security/advisories/new) to submit a confidential report. If private reporting is unavailable, use a contact method listed on the [repository owner's GitHub profile](https://github.com/MRsuffixx) to request a secure communication channel without including vulnerability details in the initial message.

Include as much of the following as possible:

- The affected route, component, commit, or deployment
- Vulnerability type and potential impact
- Exact reproduction steps or a minimal proof of concept
- Required account state, permissions, and configuration
- Relevant request and response samples with secrets and personal data removed
- Suggested mitigation, if known
- Whether the issue has been disclosed to anyone else

Use synthetic test data. Do not include authentication secrets, payment credentials, session tokens, private user information, or data obtained from unrelated accounts.

## Response process

Maintainers aim to:

1. Acknowledge a complete report within three business days.
2. Provide an initial assessment within seven business days.
3. Share progress updates at least every seven business days while remediation is active.
4. Coordinate validation, release timing, disclosure, and attribution with the reporter.

These targets are not guarantees. Complex reports, third-party dependencies, and operational constraints may require additional time. Duplicate, non-reproducible, or out-of-scope reports may be closed with an explanation.

## Coordinated disclosure

Allow maintainers reasonable time to investigate and release a fix before public disclosure. Do not access, modify, retain, or share data beyond the minimum necessary to demonstrate the issue. Stop testing and report immediately if you encounter personal data, production secrets, financial information, or service instability.

When appropriate, a security advisory will describe affected versions, impact, remediation, and reporter credit. Credit is optional and will follow the reporter's preference.

## Research guidelines

Good-faith research must:

- Use accounts and data you own or have explicit permission to test
- Avoid privacy violations, service disruption, denial of service, spam, social engineering, and physical attacks
- Avoid automated testing that creates excessive traffic or large volumes of records
- Avoid persistence, destructive actions, and lateral movement after confirming an issue
- Comply with applicable law and the rules of third-party providers
- Give maintainers an opportunity to remediate before disclosure

Research that follows this policy will not be treated as malicious by the project. This statement does not bind third parties and is not a waiver of applicable law.

## Generally out of scope

The following reports usually do not qualify unless they demonstrate a concrete security impact:

- Missing security headers without an exploitable consequence
- Self-cross-site scripting that requires a user to paste code
- Clickjacking on pages without sensitive actions
- Rate-limit observations without a practical abuse scenario
- Username, content, or spam reports that do not cross a security boundary
- Vulnerabilities that exist only in unsupported browsers or modified third-party deployments
- Automated scanner output without manual validation and reproduction steps
- Social engineering, denial-of-service, or physical attacks

## Secrets found in the repository

If you discover a credential or token in repository history, report it privately and do not attempt to use it. Identify the file and commit, but do not copy the secret into additional messages, issues, or pull requests.
