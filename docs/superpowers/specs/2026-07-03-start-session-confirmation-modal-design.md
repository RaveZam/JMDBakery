# Start Session Confirmation Modal

## Problem

`StartSessionFooter` (`apps/agent-app/src/features/routes/components/route-detail-screen-components/StartSessionFooter.tsx`) starts a route session immediately on tap, with no confirmation step. A mis-tap starts a session the agent didn't mean to start.

## Goal

Add a confirmation modal between the button tap and the actual `start()` call, so the agent must explicitly confirm before a route session begins.

## Design

### New component: `StartSessionModal.tsx`

Location: `apps/agent-app/src/features/routes/components/route-detail-screen-components/StartSessionModal.tsx`

Follows the existing confirmation-modal pattern already used by `DeleteStoreModal.tsx`, `DeleteRouteModal.tsx`, `DeleteProvinceModal.tsx`, and `EndRouteModal.tsx`: a transparent `Modal` (`animationType="fade"`, `statusBarTranslucent`) with a backdrop, driven by a `visible: boolean` prop, exposing `onConfirm` / `onCancel` callbacks.

Content:
- Icon circle: green-tinted (matching the app's brand green `#0b4c29`), `play` icon (Ionicons)
- Title: "Start Session"
- Body: "Are you sure you want to start this route session?"
- Buttons: Cancel (outline) / Start (filled green)

No route-specific data (name, store count, etc.) is shown — this is a plain generic confirm, matching the simplicity of `EndRouteModal`.

### Style additions to `modalStyles.ts`

Shared file: `apps/agent-app/src/shared/styles/modalStyles.ts`

Add three new keys, mirroring the existing `deleteIconWrap` / `deleteButton` / `deleteText` keys but green instead of red:
- `confirmIconWrap` — 56px circle, green-tinted background (e.g. `#EAF6EF`), analogous to `deleteIconWrap`'s `#FEF2F2`
- `confirmButton` — filled pill button, background `#0b4c29`
- `confirmText` — white, semibold, matching `deleteText`'s weight/size

Existing shared keys (`backdrop`, `content`, `title`, `body`, `buttons`, `cancelButton`, `cancelText`) are reused as-is.

### `StartSessionFooter.tsx` changes

- Add local `visible` state (`useState(false)`).
- Button `onPress` sets `visible = true` instead of calling `start()` directly.
- Render `<StartSessionModal visible={visible} onConfirm={...} onCancel={() => setVisible(false)} />` alongside the existing footer `View`.
- `onConfirm`: set `visible = false`, then call `start()` (from the existing `useStartSession()` hook — unchanged).
- The button's existing `loading` / `ActivityIndicator` / `disabled` behavior is unchanged — it still reflects `useStartSession()`'s `loading` state, now entered after confirmation instead of immediately on tap.

No changes to `useStartSession.ts`, no prop drilling into `StartSessionFooter` (it stays self-contained, as it is today), no new shared/generic modal abstraction (consistent with "no new abstractions without 2+ real call sites" — this follows the existing per-feature modal pattern instead).

## Out of scope

- Showing route name, store count, or other contextual info in the modal
- Any change to what happens after a session starts (navigation, inventory screen, etc.)
- A reusable/generic `ConfirmModal` component — not justified by a single call site
