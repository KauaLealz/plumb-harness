# Crystallizing critical journeys

When `.plumb/config.env`'s `PLUMB_TEST_CRYSTALLIZE` is `critical` and a
journey that just passed covers a flow the project marked critical
(`.plumb/overlay/testing.md`), turn it into permanent regression coverage:

1. Write the journey as a real Playwright test under `.plumb/e2e/`.
2. Write the stub(s) it depends on under `.plumb/mocks/`.

This is how CI gains regression coverage on critical flows without anyone
having to remember to write a test for them later — the journey that just
proved the delivery works becomes the thing that catches the next
regression.

`PLUMB_TEST_CRYSTALLIZE=off`: skip this step entirely, even for critical
flows — the project opted out.
