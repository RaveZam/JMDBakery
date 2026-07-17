# 0001. Rebuilding the Old Architecture

Date: 2026-07-17

## Status

Ongoing

## Context

current caching implementation is not optimal, it now queries regardless of dates,

## Decision

maxing it out to 30 days from current date will cut down so much of the loading times, combined with the current global cache.

## Consequences

more code to write but much more efficient on a daily use basis

## Alternatives Considered
