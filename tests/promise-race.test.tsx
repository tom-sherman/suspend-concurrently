import { usePromiseRace } from "../src/index";
import { expect, test } from "@jest/globals";
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { Deferred } from "./util";
import { Await } from "react-router";

test("promise race", async () => {
  function Component({ p1, p2 }: { p1: Promise<number>; p2: Promise<number> }) {
    const promise = usePromiseRace([p1, p2]);

    return (
      <Suspense fallback={<div>loading</div>}>
        <Await resolve={promise}>{(n) => <div>{n}</div>}</Await>
      </Suspense>
    );
  }

  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  render(<Component p1={p1.promise} p2={p2.promise} />);

  expect(screen.getByText("loading")).toBeTruthy();
  p1.resolve(1);

  await screen.findByText("1");
});
