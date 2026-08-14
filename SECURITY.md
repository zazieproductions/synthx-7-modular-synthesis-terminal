# Security Policy

SYNTHX-7 is a fully client-side application: it has no backend, no user
accounts, and does not persist or transmit personal data. Audio is generated
in the browser via the Web Audio API.

## Supported versions

Only the latest release on the default branch (`main`) is supported with
security updates.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a vulnerability

If you believe you have found a security issue, please report it privately
rather than opening a public issue:

1. Email the maintainers with a clear description, affected version, and steps
   to reproduce.
2. Allow a reasonable window for a fix before public disclosure.
3. Do not include exploit code in public issues or pull requests.

We will acknowledge receipt as soon as possible and keep you informed of our
progress.

## Scope

Relevant reports typically concern:

- Dependencies with known vulnerabilities (see Dependabot alerts).
- Malformed preset/input handling that could crash the engine.
- Browser API misuse that could enable unexpected behaviour.

Out of scope: issues requiring physical access, social engineering, or a
compromised browser environment.
