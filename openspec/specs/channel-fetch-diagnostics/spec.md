# channel-fetch-diagnostics Specification

## Purpose
TBD - created by archiving change add-channel-fetch-diagnostics. Update Purpose after archive.
## Requirements
### Requirement: Channel fetch API errors expose safe diagnostic fields
The system SHALL return structured JSON error responses for failed channel feed and channel resolution API requests. Each error response SHALL include a stable `code`, a human-readable `error`, and a `requestId`. When an upstream YouTube response is available and failed, the response SHALL include the upstream HTTP status as a safe diagnostic field.

#### Scenario: Channel feed request is missing channel ID
- **WHEN** `/api/channel-feed` is called without a `channelId`
- **THEN** the API returns a JSON error with code `MISSING_CHANNEL_ID` and a `requestId`

#### Scenario: Channel feed upstream returns non-ok status
- **WHEN** YouTube RSS returns a non-2xx status for a channel feed request
- **THEN** the API returns a JSON error with code `YOUTUBE_RSS_UPSTREAM_ERROR`, the upstream status, and a `requestId`

#### Scenario: Channel feed upstream fetch throws
- **WHEN** the server cannot complete the YouTube RSS fetch because of a network, timeout, or runtime exception
- **THEN** the API returns a JSON error with code `YOUTUBE_RSS_FETCH_ERROR` and a `requestId`

#### Scenario: Channel feed response cannot be parsed as RSS
- **WHEN** YouTube RSS returns a 2xx response that does not contain a parseable RSS or Atom feed
- **THEN** the API returns a JSON error with code `YOUTUBE_RSS_PARSE_ERROR` and a `requestId`

#### Scenario: Channel resolution request is missing path
- **WHEN** `/api/resolve-channel` is called without a `path`
- **THEN** the API returns a JSON error with code `MISSING_CHANNEL_PATH` and a `requestId`

#### Scenario: Channel resolution upstream returns non-ok status
- **WHEN** YouTube returns a non-2xx status other than 404 while resolving a channel URL path
- **THEN** the API returns a JSON error with code `YOUTUBE_CHANNEL_UPSTREAM_ERROR`, the upstream status, and a `requestId`

#### Scenario: Channel resolution upstream returns not found
- **WHEN** YouTube returns a 404 status while resolving a channel URL path
- **THEN** the API returns a JSON error with code `YOUTUBE_CHANNEL_NOT_FOUND`, upstream status `404`, and a `requestId`

#### Scenario: Channel resolution cannot parse channel ID
- **WHEN** the server successfully fetches a YouTube channel page but cannot parse a stable channel ID
- **THEN** the API returns a JSON error with code `YOUTUBE_CHANNEL_PARSE_ERROR` and a `requestId`

#### Scenario: Channel resolution upstream fetch throws
- **WHEN** the server cannot complete the YouTube channel page fetch because of a network, timeout, or runtime exception
- **THEN** the API returns a JSON error with code `YOUTUBE_CHANNEL_FETCH_ERROR` and a `requestId`

### Requirement: Server logs include actionable channel fetch diagnostics
The system SHALL write structured server-side diagnostics for failed channel feed and channel resolution requests. Diagnostic log entries SHALL include the request ID, route name, runtime environment, Vercel region when available, target channel ID or path, elapsed time, upstream URL, upstream status when available, selected safe upstream headers when available, a short sanitized upstream body snippet when available, and exception name/message when applicable.

#### Scenario: Upstream channel feed response fails
- **WHEN** YouTube RSS responds with a non-2xx status
- **THEN** the server logs a structured diagnostic entry that includes the request ID, upstream status, elapsed time, selected headers, and a sanitized body snippet

#### Scenario: Channel feed parse fails
- **WHEN** the channel feed route receives a 2xx upstream response that cannot be parsed as RSS or Atom
- **THEN** the server logs a structured diagnostic entry that includes the request ID, elapsed time, selected headers, and a sanitized body snippet

#### Scenario: Channel resolution fetch throws
- **WHEN** the channel resolution route catches a fetch exception
- **THEN** the server logs a structured diagnostic entry that includes the request ID, elapsed time, runtime environment, and exception details

#### Scenario: Channel resolution upstream response fails
- **WHEN** YouTube responds with a non-2xx status while resolving a channel URL path
- **THEN** the server logs a structured diagnostic entry that includes the request ID, upstream status, elapsed time, selected headers, and a sanitized body snippet

#### Scenario: Channel resolution parse fails
- **WHEN** the channel resolution route receives a 2xx upstream response but cannot parse a stable channel ID
- **THEN** the server logs a structured diagnostic entry that includes the request ID, elapsed time, selected headers, and a sanitized body snippet

### Requirement: Local debug responses expose extended diagnostics only outside production
The system SHALL support local-only extended debug detail for channel feed and channel resolution failures when `debug=1` is provided. Extended debug detail SHALL be omitted from Vercel production responses even when `debug=1` is provided.

#### Scenario: Local channel feed debug failure
- **WHEN** a developer calls `/api/channel-feed?channelId=<id>&debug=1` locally and the upstream request fails
- **THEN** the JSON error includes extended debug detail such as elapsed time, selected upstream headers, and a sanitized body snippet

#### Scenario: Vercel channel feed debug request
- **WHEN** a caller sends `debug=1` to the deployed Vercel channel feed route and the upstream request fails
- **THEN** the JSON error omits extended debug detail while preserving the safe `code`, `error`, `requestId`, and upstream status fields

#### Scenario: Local channel resolution debug failure
- **WHEN** a developer calls `/api/resolve-channel?path=<path>&debug=1` locally and the upstream request or parse step fails
- **THEN** the JSON error includes extended debug detail such as elapsed time, selected upstream headers, and a sanitized body snippet when available

#### Scenario: Vercel channel resolution debug request
- **WHEN** a caller sends `debug=1` to the deployed Vercel channel resolution route and the upstream request or parse step fails
- **THEN** the JSON error omits extended debug detail while preserving the safe `code`, `error`, `requestId`, and upstream status fields when available

### Requirement: Client channel fetch helpers preserve diagnostic references
The client channel RSS helpers SHALL parse structured JSON error responses from channel feed and channel resolution APIs. Thrown errors SHALL preserve the API `code` and `requestId` when those fields are present.

#### Scenario: Channel feed helper receives structured API error
- **WHEN** `fetchChannelFeed()` receives a non-ok JSON error response from `/api/channel-feed`
- **THEN** it throws an error that preserves the response code and request ID

#### Scenario: Channel resolution helper receives structured API error
- **WHEN** `resolveChannelId()` receives a non-ok JSON error response from `/api/resolve-channel`
- **THEN** it throws an error that preserves the response code and request ID

