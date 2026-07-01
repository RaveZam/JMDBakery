# 0001. Colocated component structure with layered separation

Date: 2026-07-01

## Context

As the codebase grows i find it harder and harder to keep testing the same old features, and most of the time i just assume that the old features were not touched after coding and developing new features. So i looked into how do software companies test their code. So i studied 4 different open source companies that was maintained by proper senior engineers and a team behind it. My Findings was extremely useful. Some followed the pyramid of testing, unit testing -> component testing -> integration testing -> E2E testing, and it was a mix of 80% of the 3 and 20% or less E2E testing since that was the most expensive thing to run. Some codebases even had 80% E2E and only 20% pure unit testing. So i figured i just try to implement a balanced mixed of everything but ofc following the pyramid rule, to see for myself what is actually needed. the codebase that only had E2E might've considered thats what all they need to keep the tests not bloated.

## Decision

1 **Writing integration tests and some component tests (to only interacted by users)**

- i started to write simple integration testing in our DAO's, utilizing a nodejs sqlite database for testing and translating it so we can run expo sqlite commands that we can actually run and test without an app's mobile device database.
- Hook tests are also written to see if triggering the hooks actually interacts with the DAO's correctly.

2 **Moving the tests on **test** on each feature folder**

- On other codebases they have all of the tests on one file, and labeled per feature. Testing out currently if its easier to read and maintain if its inside /feature/**test** on each features so it sits close to their own corresponding services and components

## Benefits

- Code is now very testable starting from the routes. No more guessing if it behaves the same as expected on every feature i release and touch

## Open question

- i Still dont know if the types of test im writing is the best practice, right now my hook tests, tests what functions triggers and still actually triggers the services and daos. But i already written integration tests to those. Is it better to only test the hooks on what it wires to but not actually run it? since i already run the dao tests separately. so its like answering the same question twice. Or its better to remove my integration tests and leave the component tests since it tackles both.
