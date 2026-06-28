# Route Rename — Design

**Date:** 2026-06-28
**Status:** Approved (pending spec review)
**Scope:** agent-app (Expo) — `src/features/routes`

## Goal

Let a field agent rename a route from the `RouteDetailScreen` banner. The data
layer already exists (`updateRouteName` in `route-save-service.ts`, backed by
`RoutesDao.renameRoute`, with outbox sync). This work is UI wiring only, plus a
small fix so the routes list reflects the new name after navigating back.

## Trigger UX

A pencil icon (`Ionicons name="create-outline"`) sits next to the route name in
`RouteDetailBanner`. Tapping it opens a `RenameRouteModal`.

```
┌─────────────────────────────────┐
│ [←]                  [ + Location]│
│                                   │
│ ▍ROUTE • 3 provinces              │
│ North Luzon Route   ✎             │
└─────────────────────────────────┘
```

## Constraint: name comes from a nav param

`RouteDetailScreen` reads `routeName` via `useLocalSearchParams`, which is
immutable for the screen's lifetime. After a rename the banner must reflect the
new name immediately, so the displayed name is held in local React state
(seeded from the param).

## Architecture (Approach A — dedicated hook)

Mirrors the existing `useProvinces`/`useRoute` patterns; keeps
`RouteDetailScreen` declarative and respects the hooks-are-React-glue rule.

### 1. New hook — `src/features/routes/hooks/useRouteName.ts`

- Reads `{ routeId, routeName }` from `useLocalSearchParams` itself (no args,
  same as `useProvinces`).
- `name` state seeded from `routeName ?? "Route"`.
- Modal open/close state, shaped like `useRoute`'s `create` object.
- Returns `{ name, rename: { isModalOpen, openModal, closeModal, submit } }`.
- `submit(next)`:
  - trim `next`;
  - if empty **or** equal to current `name` → just close (no DB write — keeps
    the outbox clean);
  - else `updateRouteName(routeId, next)`, `setName(trimmed)`, close.
- Guard: if `routeId` is missing, `submit` is a no-op (shouldn't happen via
  normal navigation).

### 2. New component — `RenameRouteModal.tsx`

Location: `src/features/routes/components/route-detail-screen-components/`.

- Props: `visible`, `currentName`, `onSubmit(name)`, `onClose`.
- Styled after `EditProvinceModal`'s edit form / `CreateRouteModal` (white
  rounded card, "Rename Route" title, single text input).
- Seeds the input from `currentName` in `onShow`; `autoFocus`; Save disabled
  while the trimmed input is empty.

### 3. `RouteDetailBanner.tsx`

- Add one prop: `onRename: () => void`.
- Wrap the route-name `Text` and a pencil `TouchableOpacity`
  (`create-outline`, ~18px, white-ish, with `hitSlop`) in a row.

### 4. `RouteDetailScreen.tsx`

- Replace the raw `routeName` param with `useRouteName()`.
- Pass `routeName={name}` and `onRename={rename.openModal}` to the banner.
- Render `<RenameRouteModal visible={rename.isModalOpen} currentName={name}
  onSubmit={rename.submit} onClose={rename.closeModal} />`.
- Keep reading `routeId` from params for `AddProvinceModal` (unchanged).

### 5. Stale-list fix — `useRoute.ts`

After a rename, navigating back to `RoutesScreen` would show the old name
because `useRoute` only loads on mount. Add `useFocusEffect(loadRoutes)` so the
list refreshes whenever it regains focus.

## Edge cases

- Empty / whitespace name → Save disabled in the modal; `submit` also guards.
- Unchanged name → no DB write, modal just closes.
- Missing `routeId` → `submit` no-ops.

## Testing

No pure `core/` logic (validation lives in the service), so this is React glue.
Optional light RNTL test on `RenameRouteModal`: Save disabled when empty;
`onSubmit` fires with the trimmed value.

## Out of scope

- Renaming from the routes list screen (only the detail banner).
- Any change to the sync/outbox layer (already handles route updates).
