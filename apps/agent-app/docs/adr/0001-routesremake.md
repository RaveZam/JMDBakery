# 0001. Colocated component structure with layered separation

Date: 2026-07-01

## Context

The codebase initially started with a complex cursor generated code structure that was difficult to navigate and maintain. The goal is to restructure the codebase to be more maintainable and easier to navigate. For a simple crud i had a God hook that extracted 10 states on one file, and so much prop drilling that it was hard to follow. After 2 design remakes i settled with the current architecture of our routes section. It mainly consists of holding modal states inside the screen itself (i allowed that to lessen extracting and passing from hooks, but on a few hooks i left it at the hook level since it was used only a few times) As a result i have a cleaner and i think acceptable amount of prop passing with consisting only 1-2 and only 1-2 components deep. i My first remake was consisting of context, the code was less and the code was cleaner since each components consume their own hooks, and the states are shared so having multiple states was super clean and no issue. The problem is i kept thinking that was overkill for a simple crud page, the thing making it hard was just having to handle multiple modals. Some modals trigger a state change in another modal and from a neighboring component that is one up from the parent and 2-3props down in the children. As a challenge i remade it the 2nd time to attempt making a simpler solution with no Context.

## Decision

1. **Accepting modal states into the screen.**
   - initially i wanted to have screens with absolute no states. Since i wanted a rule of each components does their own thing, screen solely renders components. but wanting that caused me to prop drill so much and overuse hooks. As a solution i accepted the tradeoff of dropping that but having a simpler implementation that is even readable and maintainable. I Kept the pass through's limited to only what is needed. I Kept the few states that needs to be shared like an id included into a pass.

2. **Dropping Context even tho it provided cleaner code**
   - Context was the perfect solution here, my first draft had so much less code that literally components pull their own states, it was all in sync since it was at a context, hooks consumed to the context and all components pulled their own individual data. In Theory the performance is still the same regardless of the fact that everything under the context rerenders all the components. Since every props passed into for example component b from a parent A, triggering the state change on component a rerenders parent a and parent b, so its very similar if not the same. The technical trade off was almost non existing in my current estimate

3. **Simplifying how we handled states more by settling with useStates**
   -as i said earlier i dropped off context and went with useStates, i think its slightly more code but its more readable and maintainable.
   JMDbakery/jmd-app/apps/agent-app/src/features/routes. For reference.
   to lessen complexity i pulled modals downwards so a for example, a page that triggers the delete, owns the delete modal, in that way we only need to pass it once. to that component. Vs having it to the parent, youd have to lift the state up and pass it to 2 components in order to keep a shared state

## Consequences

- Code was slightly more thicker, had to accept more prop drilling in some cases. And States bled into the screens

## Benefits

- Code was arguably more readable and simpler in terms of implementation. For a simple crud page that holds a few state i think this is one of the few simplest implementations without a context.

## Open question

-On this cases i still wonder if using state managements was the right call since it did infact have extremely more readable and smaller amount of code. maybe just me overthinking that i overengineered a simple crud page
