# Store Import and Agent Route Assignment — Process Documentation

## Overview
This process handles incoming **store import requests** and ensures each store is correctly linked to an agent's assigned province before it becomes visible on that agent's delivery/sales route. It combines a store lookup/registration step with a province-link validation step to keep the agent-province-store relationship consistent.

## Purpose
- Prevent duplicate store records by checking `store_id` before creating a new entry.
- Maintain a conjunction (junction) table linking `agent`, `province_id`, and `store_id`, since one agent can serve multiple stores across a province.
- Guarantee that a store only appears on an agent's route once its province link has been validated.

## Process Flow

### 1. Import Store Request
Entry point of the process. Triggered whenever a store import request is submitted (e.g., from a bulk import, mobile app, or admin action).

### 2. Look Up Store by `store_id`
The system checks whether the store already exists in the database using its `store_id`.

### 3. Decision — Store Found?
| Branch | Action |
|---|---|
| **Yes** | Proceed to **Copy Store Details Locally** |
| **No** | Proceed to **Register as New Store** |

### 4a. Copy Store Details Locally
If the store already exists, its details are copied into the local/working dataset for further processing (no duplicate record is created).

### 4b. Register as New Store
If no matching store is found, a new store record is created. This path then rejoins the main flow at **Create Conjunction Table Entry**.

### 5. Create Conjunction Table Entry
A record is created (or updated) in the conjunction table combining:
- `agent`
- `province_id`
- `store_id`

This is the table that ties a specific agent to a specific store within a specific province.

### 6. Decision — Valid Province Link?
| Branch | Action |
|---|---|
| **Yes** | Proceed to **Agent Route Updated** |
| **No** | Proceed to **Fix Province Mapping** |

### 7a. Agent Route Updated → Store Visible in Route
Once the province link is validated, the agent's route is updated, and the store becomes visible in that agent's route. This is the successful end state of the process.

### 7b. Fix Province Mapping → Back to Register as New Store
If the province link is invalid, the mapping is corrected, and the flow loops back to **Register as New Store** to re-attempt registration/linking with the corrected province data.

## Flow Summary Table

| Step | Type | Description |
|---|---|---|
| Import store request | Start | Entry point of the process |
| Look up store by store_id | Process | Checks for existing store record |
| Store found? | Decision | Branches based on lookup result |
| Copy store details locally | Process | Reuses existing store data |
| Register as new store | Process | Creates a new store record |
| Create conjunction table entry | Process | Links agent + province_id + store_id |
| Valid province link? | Decision | Validates the province mapping |
| Agent route updated | Process | Updates the agent's assigned route |
| Fix province mapping | Process | Corrects an invalid province link |
| Store visible in route | End | Successful completion state |

## Notes / Points to Verify
- The loop from **Fix Province Mapping** back to **Register as New Store** re-enters the flow at the registration step rather than directly retrying the conjunction table entry — worth confirming this is intentional, since it could re-trigger store creation logic unnecessarily for a store that already exists but simply has bad province data.
- There's no explicit handling shown for what happens if **Fix Province Mapping** itself fails (e.g., no valid province exists) — consider whether an error/exit state is needed.
- Consider adding a data validation note on what qualifies a province link as "valid" (e.g., province_id exists in the provinces table, is active, etc.).
