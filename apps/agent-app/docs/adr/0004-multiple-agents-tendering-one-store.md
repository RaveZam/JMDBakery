# 0004. Multiple Agents Tendering One Store

Date: 2026-07-29

## Status

Ongoing

## Context

JMD Requested to have a credit feature, that takes debts or accounts receivables from different stores, and the tricky part is, multiple agents can tender other multiple stores by other agents.

The original design was 1 agent per store, but from our latest conversation with JMD. It was clearly not the case anymore

This completely breaks the current design on how we handle store ownership, the core challenge now is how do we migrate the code to tender that change, that affects many foundation of the system.

## Decision

What i decided was to add a feature where agents can import other agents stores, registered by other agents.

## Consequences

But implementing this is tricky since routes -> province -> store are all linked and tied together, meaning implementing this would need to handle inconsistent PK's and links.

## Solution to the consequence

Province - Store Conjunction table -> this table simply links existing stores from other agents, and links it with the provinces
in the agent's route locally, this way the agent will add this in to their routes without having dependency in the store, since the store will still own the
original province_id from the original owner

so when we add a existing store, in a route. We would simply add the entire store details in the local database, and then proceed to link it with what province are we adding it to, so province_id FROM the agent itself and then the store_id from the existing store_id. Now the original province_id from the store will be held at the store table itself. This is how we track if this agent owns this store or not.

## Alternatives Considered

I Definitely considered just adding the store into the store table alone, but the issue is, which province do i link to it?. I Could relink it with the province from the agent. but syncing will be an issue, server side we would have 2 rows of the store. linked to different provinces. or a mismatch.
There fore i think with the conjoined table, its much more easier to handle
