# 0001. Rebuilding the Old Architecture

Date: 2026-07-17

## Status

Complete

## Context

Old code provided inconsistent caching of data, website was slot, and loading was inconsistent, dashboard upto records page would load slow at first, and sessions and stores would have their own separate load, and going to navigate back into those pages would load again, The reason was inconsistent caching. First off, i tried to optimize the website that regardless if they have years and years of data, that it would still function fast, but the way how i need the data, up to the hour based, and viewing orders as a log book, i cant aggregate the data by weekly, i needed to maintain it by order singular. This disallowed me to aggregate it, so querying for sales means litteraly quering 70k+ rows of data. Which doesnt simply scale.

## Decision

I Batched what page needs the same data. So Dashboard, Intelligence and Records page pretty much need the same base data. hence getBaseData is on a server file shared, not directly in the feature scope. Session would need different batch of data, since we need to have the data of the route_session, session_stores and their inventory. so ive put its own query on that feature scope, same with stores, since we needed the store details and contact owners.

And i finally decided to just cut the query to at max 30days previous, which cut load time by so much

All of them pretty much owns a client side fetch and cache. 5 mins stale, owning their own unique cache key. the effect of this is a fast initial load combined with instant nav back to individual page.

## Alternatives Considered

I Considered using server prefetch + dehydrate implementation, but in my first attempt simply navigating back to the page would still have loading even though you just exited the page. since dehydrating the cache into the page would need the page to be asynchronous so loading is inevitable. Testing with the client side fetch which was simpler to implement and honestly, provided much better experience

I Also considered having KPI keys and other metrics pull their own data, that was the initial plan for this ADR, but mid way i realized that grouping a base data, caching it once and reusing it for multiple pages was the good call. it is light both in server side and the client side (browser)
