# 0005. Auth Session Handling: Fresh Installs and Token Expiry

Date: 2026-08-11

## Status

Completed

## Context

When conducting irl tests, i noticed on a fresh installed tablet, the app instantly ignored the auth page and went straight to the home page.
Well this would be the case given that i still enabled the app to be usable with a expired token (due to supabase 2h limit lifetime on each token).

This was my previous decision as there is no way to configure the 2h limit on the free tier currently, As a remedy for the present scenario, i simply made it even if the token is expired, agents can still proceed

And the consequence was even if there is no token, its still considered invalid so it would still log in, fresh installs

## Decision

The decision was simple, it was to track when was the last sign in of this device, similar to a trusted device feature.

The simple process was everytime agents log in, they store a stamp in app_settings table. if the agent signed in in the last 7 days, Then this device
would be considered "trusted" and then proceed.

However if there is no stamp, and their last login was more than 7 days, for security reasons they would need to authenticate again. and be completely closed off the app

## Consequences

Technically this solution isnt sound, since we only base if there is a last login, since we have no way to verify token validity offline in scenarios the agents
are in a no wifi spot. This would only be solved when we are able to configure the 2h limit on the pro tier when we handover the system to JMD Bakery.

with that, tokens actually live more than enough time for agents to experience signal in their trips and we dont have to do this trust device mechanic.

## Alternatives Considered

i considered simply just storing just the auth id in the settings-dao, but that would only mean as long as they logged in once, they can technically use the app for infinity, we still need a time cutoff so i just resorted to a last logged in mechanic plus storing the agent information
