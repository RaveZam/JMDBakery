# 0003. Inventory Design

Date: 2026-07-06

## Status

completed

## Context

JMD Needs to track the morning inventory of the agents, and reconcile at the end.

the basic context is Agents go to the factory in the morning and load their vans with breads.

then conduct their trip.

After the trip, they return to the factory and unload their vans and count whatever is left. Then reconcile based from how many they sold and what ever is left,

if there is a discrepancy, or it doesnt match the computation of sold vs what is left, we need to mark that as variance (untracked loss)

## Decision

My decision when writing this feature is to ofcourse first separate the 2 data tables, morning_inventory and ending_inventory (tied to the morning inventory ofc)

and just like in their business process, the agents would simply log whatever they count at the specific periods. Just digitalized

And as for counting the stock, instead of having a decrementing inventory table, i base the stock off of sales. (ill explain more)

The reason for this implementation is deriving from the sales base from the current session store (unique instance of the store) is this is 1 less table to keep
in track of syncing. Deriving from sales table for the inventory will simply mean we only sync 1 table (sales) everytime we are in route.

and tracking the inventory is simply based from morning inventory - how many of that product we have sold on this session. easy.

and with that tracked, after the agent logs the ending inventory, we can simply compute the variance by subtracting the ending inventory from the morning inventory and the sales.

## Consequences

This approach is technically more complex to implement, but for syncing i deem this is a good approach for the current state of the application.

## Alternatives Considered

a decrementing inventory count table on each session, technically this is much simpler to implement, we would just continuosly decrement the count on the offline
database and keep querying it, its more linear.

But the issue with that implementation is syncing could be a problem, per sale we would have to keep in track of the inventory count, and the sale count. which will technically put more requests in the server more and i just see it as more areas syncing that can fail, once we fail 1 sync, in the admin side it would appear a variance, but in the app, it counted as 0 variance.

theres just things that can go wrong with this approach
