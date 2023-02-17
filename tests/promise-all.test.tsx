import { usePromiseAll } from "../src/index";
import { expect, test } from "@jest/globals";
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { Deferred, usePromise } from "./util";

test("resolve promise alongside usePromiseAll", async () => {
  function TestComponent({
    p1,
    p2,
  }: {
    p1: Promise<number>;
    p2: Promise<number>;
  }) {
    const promise = usePromiseAll([p1, p2]);
    const [x, y] = usePromise(promise);

    return <div>{x + y}</div>;
  }

  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  render(
    <Suspense fallback={<div>loading</div>}>
      <TestComponent p1={p1.promise} p2={p2.promise} />
    </Suspense>
  );

  expect(screen.getByText("loading")).toBeTruthy();
  p1.resolve(1);
  expect(screen.getByText("loading")).toBeTruthy();
  p2.resolve(2);

  await screen.findByText("3");
});

test("create promise in parent", async () => {
  function Parent({ p1, p2 }: { p1: Promise<number>; p2: Promise<number> }) {
    const promise = usePromiseAll([p1, p2]);

    return (
      <Suspense fallback={<div>loading</div>}>
        <Child p={promise} />
      </Suspense>
    );
  }

  function Child({ p }: { p: Promise<[number, number]> }) {
    const [x, y] = usePromise(p);
    return <div>{x + y}</div>;
  }

  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  render(<Parent p1={p1.promise} p2={p2.promise} />);

  expect(screen.getByText("loading")).toBeTruthy();
  p1.resolve(2);
  expect(screen.getByText("loading")).toBeTruthy();
  p2.resolve(2);

  await screen.findByText("4");
});
