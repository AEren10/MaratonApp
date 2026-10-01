# Maraton Product Analytics Foundation Design

Date: 2026-10-02

## Objective

Make the existing Supabase-backed product analytics pipeline reliable enough to answer product questions without changing the app's visual design or introducing a new analytics vendor before V1.

The completed foundation must answer:

- Which screens are used most and least?
- How long do users stay on each screen?
- Where do users leave or move next?
- How many users complete onboarding, create a route, begin studying, and record meaningful study activity?
- What are D1, D7, and D30 meaningful-learning retention rates?
- Are analytics events arriving without silent loss, cross-account attribution, or duplicate inflation?

## Scope

### Included

- Harden the existing `analytics_events` client pipeline.
- Preserve the existing provider-independent `track()` API.
- Add stable event identifiers and original timestamps.
- Partition durable event buffers by user and protect user changes during flush.
- Close analytics identity explicitly on logout and account deletion.
- Start a new analytics session after a long background interval.
- Sanitize event properties centrally before persistence or transmission.
- Remove raw notification URLs and database row identifiers from analytics properties.
- Connect only the missing events needed for the active V1 learning loop.
- Add migration-safe analytics schema hardening, RLS, grants, indexes, and retention equivalents without opening aggregate behavior data to clients.
- Add automated tests for the analytics state machine, navigation lifecycle, property sanitization, and core V1 events.
- Add operator SQL for health, screen usage, duration, paths, funnels, and meaningful retention.
- Document exactly where and how the owner reads the data in Supabase.
- Align repository privacy/store declarations with actual first-party product analytics behavior.

### Excluded

- PostHog, Amplitude, Firebase Analytics, GA4, or another new analytics SDK.
- Session replay, heatmaps, ad attribution, advertising IDs, or cross-app tracking.
- An in-app admin analytics screen.
- A public or authenticated aggregate analytics RPC.
- Premium, league, community, social, or card-payment analytics for V1-suspended surfaces.
- A custom web admin dashboard.

An admin-only visual surface may be designed later. It must read aggregate data through a server-controlled backend or private database function, never by granting the mobile authenticated role access to other users' event rows.

## Chosen Architecture

Supabase remains the system of record. Mobile code emits a small, documented set of events through the existing `src/lib/analytics.js` boundary. Events are durably buffered on-device and inserted into `public.analytics_events`. Product reports are owner-only SQL queries run in Supabase SQL Editor.

No third-party analytics SDK is added in this phase. This avoids a new native dependency, a second event stream, new data-processing disclosures, and App Review risk immediately before V1.

## Data Contract

Each analytics event has:

- `client_event_id`: stable client-generated identifier used for idempotency.
- `user_id`: authenticated Supabase user ID.
- `session_id`: analytics session identifier.
- `event`: canonical name from `src/constants/analytics.js`.
- `props`: sanitized JSON object.
- `occurred_at`: original client event time, preserved through offline and pre-auth queues.
- `created_at`: database insertion time.

Legacy rows may have a null `client_event_id`. New rows must have a non-null identifier at the client boundary. A unique database constraint/index on `(user_id, client_event_id)` prevents retry duplicates.

## Client State Model

### Event creation

`track()` immediately creates the complete immutable event envelope: event ID, event name, sanitized properties, original occurrence time, and the current session ID when available.

Events emitted before authentication retain their original timestamp and pre-auth session identifier. When a user authenticates, they are adopted by that user without recreating them.

### User partitioning

Durable authenticated buffers are stored per user. Loading user B must not overwrite or delete unsent events belonging to user A. Only the active user's partition is flushed.

Anonymous pending events use a separate key. They are adopted only by the account that completes the current authentication flow. Logout does not reassign already authenticated events.

### Initialization

Initialization merges events produced while storage is loading instead of replacing the in-memory buffer. Event IDs are used for merge and removal; array positions are not used as delivery acknowledgements.

### Flush

A flush captures the active user and generation. On success it removes only the exact delivered event IDs. If the active user changes while the request is in flight, the response cannot delete the new user's events.

Duplicate database conflicts are treated as successful delivery for those event IDs. Failures preserve the buffer and never interrupt the user-facing flow.

### Session boundary

A cold start or authentication initialization creates a session. A background interval shorter than 30 minutes resumes the same session. Returning after 30 minutes or longer starts a new session before the next `screen.view`.

### Logout and account deletion

After the final best-effort flush, analytics identity and timers are explicitly stopped even if the underlying Supabase sign-out callback is not delivered. Auth/login screens must never be attributed to the previous user.

## Property Governance

All event properties pass through a central sanitizer before local persistence.

Allowed categories include:

- Canonical screen and flow names.
- Enumerated source, provider, exam type, trial type, and subject key.
- App version, build number, and platform.
- Booleans such as `queued`, `hasImage`, and `usedFreeze`.
- Bounded counts and duration/category values needed for decisions.
- Navigation reason, next screen, and stay category.

Rejected categories include:

- Email, name, username, profile name, free-form note, question text, and error message.
- Image URL, notification token, or raw notification/deep-link URL.
- Referral, friend, or group codes.
- Database row IDs such as wrong-question, study-log, stop, group, or profile IDs.
- Advertising identifiers and location.

Unknown keys are dropped in production. Values are type-checked and strings are length-limited. The sanitizer must not throw into a user flow.

## V1 Measurement Plan

The implementation prioritizes decision-making rather than connecting every existing constant.

### Existing events retained

- `screen.view`
- `screen.exit`
- `screen.duration`
- `auth.register`
- `auth.login`
- `onboarding.complete`
- `route.created`
- `route.creation_failed`
- `route.first_action_offered`
- `route.first_action_started`
- `route.stop_transitioned`
- `study.completed`
- `trial.entered`
- `form.started`, `form.completed`, `form.abandoned`
- `push.received`, `push.opened`
- `streak.continued`, `streak.broken`

### Missing active-V1 events to connect

- `study.started`: emitted only when a real timer/study session begins.
- `plan.viewed`: emitted once per plan screen view/session, not on render loops.
- `plan.task_completed`: covers route, generated, and user tasks with safe categorical properties.
- `plan.all_completed`: emitted on the transition from incomplete to fully complete, once per day.
- `wrong.added`: emitted only after a wrong-notebook record is successfully persisted or durably queued.
- `wrong.reviewed`: emitted only after a review is successfully marked.
- `trial.compared`: emitted when comparison results are actually shown.

Events for suspended V1 features remain inactive and are documented as such.

## Database Migration Strategy

The active migration ledger assumes analytics tables already exist, while their original CREATE statements are archived. The new migration must therefore be idempotent and additive:

1. Create `analytics_events` and `retention_events` only if absent, matching the existing schema contract.
2. Add `client_event_id` to `analytics_events` if absent.
3. Create the required user/time, event/time, and unique idempotency indexes if absent.
4. Enable RLS.
5. Recreate own-row SELECT and INSERT policies safely.
6. Revoke table access from `public` and `anon`.
7. Grant only SELECT and INSERT to `authenticated`.
8. Do not grant UPDATE or DELETE.
9. Preserve account-deletion cascades.

The migration is applied before a client release starts sending `client_event_id`. Live schema catalog checks are run before deployment. No raw user event data is copied into source control.

## Reporting and Owner Access

Reports remain owner-only in Supabase:

1. Open Supabase Dashboard.
2. Select project `zrycqfehhyjrsujmajpf`.
3. Open SQL Editor.
4. Run or save the repository-provided queries.

The report bundle includes:

- Analytics health and last-seen event.
- Daily event volume and duplicate ratio.
- Screen views and unique users.
- Median screen duration and bounce rate.
- Screen-to-screen paths.
- DAU/WAU/MAU.
- Registration → onboarding → route → study activation funnel.
- D1/D7/D30 meaningful-learning retention.
- Weekly active study days.
- Push opened → meaningful activity within 24 hours.
- Streak continued/broken trends.

Meaningful retention is based on learning value (`study.completed`, a completed route stop, a trial entry, or wrong review), not merely opening the app.

No public view or mobile RPC exposes cross-user aggregate behavior.

## Privacy and Store Consistency

Repository policy and store documents will state that screen navigation, feature usage, and interaction data may be processed to understand product usage, improve user experience, and diagnose issues. They will also state that the data is not used for advertising or cross-company tracking.

The App Store Product Interaction purpose and Google Play App Interactions purpose must consistently include Analytics where required by the actual implementation. Definitive legal claims remain subject to legal review.

## Error Handling

- Analytics never blocks navigation, saves, logout, or account deletion.
- Storage and network failures preserve bounded retry buffers.
- Invalid properties are dropped rather than throwing.
- Overflow drops the oldest events within the same user partition only.
- Development diagnostics may report counts and event names, never raw property payloads or identifiers.

## Testing

Automated tests cover:

- Event ID stability across retry.
- Original pre-auth timestamp preservation.
- Initialization while events are emitted.
- User A → user B buffer isolation.
- Logout when Supabase sign-out callback is absent.
- Flush completing after a user switch.
- Duplicate acknowledgement behavior.
- Property sanitizer allow/deny behavior.
- Background at 29 minutes versus 30 minutes.
- Navigation `ready → change → pause → resume` lifecycle.
- Each newly connected V1 event fires at its success boundary and not on failure/render.
- Migration contract, RLS policies, grants, indexes, and account-delete cascade.

Verification includes focused tests, full `npm test`, `npm run check`, and a real-device smoke-test checklist. The live smoke test is complete only when the owner's Supabase SQL query shows the expected events.

## Commit Boundaries

1. Design and measurement contract.
2. Analytics client reliability and tests.
3. Database migration and migration-contract tests.
4. Active V1 event coverage and tests.
5. Reporting SQL, operator guide, and privacy/store documentation alignment.

Each commit is independently reviewable and does not include unrelated existing files.

## Success Criteria

- No existing user flow or visual design changes.
- No analytics event from user B can be attributed to user A.
- Retry cannot create duplicate new-format events.
- Events produced during initialization are not lost.
- Pre-auth occurrence times are preserved.
- Raw URLs, codes, row IDs, emails, and free text do not reach analytics storage.
- Core V1 funnel and meaningful retention can be queried from documented SQL.
- Full tests and repository checks pass.
- The owner can follow the documented Supabase path without reading source code.
