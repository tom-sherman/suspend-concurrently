import { suspendAll } from "../src/index";
import { test, expect } from "vitest";
import { Suspense, useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Deferred } from "./util";
import { Await } from "react-router";

function TestComponent({
  p1,
  p2,
}: {
  p1: Promise<number>;
  p2: Promise<number>;
}) {
  const promise = suspendAll([p1, p2]);

  return (
    <Suspense fallback={<div>loading</div>}>
      <Await resolve={promise} errorElement={<div>error</div>}>
        {([x, y]) => <div>{x + y}</div>}
      </Await>
    </Suspense>
  );
}

test("call suspendAll as child of suspense", async () => {
  function Component({ p1, p2 }: { p1: Promise<number>; p2: Promise<number> }) {
    const promise = suspendAll([p1, p2]);

    return <Await resolve={promise}>{([x, y]) => <div>{x + y}</div>}</Await>;
  }

  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  render(
    <Suspense fallback={<div>loading</div>}>
      <Component p1={p1.promise} p2={p2.promise} />
    </Suspense>
  );

  expect(screen.getByText("loading")).toBeTruthy();
  p1.resolve(1);
  expect(screen.getByText("loading")).toBeTruthy();
  p2.resolve(2);

  await screen.findByText("3");
});

test("create promise in parent", async () => {
  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  render(<TestComponent p1={p1.promise} p2={p2.promise} />);

  expect(screen.getByText("loading")).toBeTruthy();
  p1.resolve(2);
  expect(screen.getByText("loading")).toBeTruthy();
  p2.resolve(2);

  await screen.findByText("4");
});

test("renders error", async () => {
  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  render(<TestComponent p1={p1.promise} p2={p2.promise} />);

  expect(screen.getByText("loading")).toBeTruthy();
  p1.reject(new Error("error"));

  await screen.findByText("error");
});

test("blocking on half of the data", async () => {
  function Component({ p1, p2 }: { p1: Promise<number>; p2: Promise<number> }) {
    const all = suspendAll([p1, p2]);

    return (
      <>
        <Suspense fallback={<div>loading p1</div>}>
          <Await resolve={p1}>{(x) => <div>p1:{x}</div>}</Await>
        </Suspense>
        <Suspense fallback={<div>loading all</div>}>
          <Await resolve={all}>{([x, y]) => <div>sum:{x + y}</div>}</Await>
        </Suspense>
      </>
    );
  }

  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  const { container } = render(<Component p1={p1.promise} p2={p2.promise} />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div>
        loading p1
      </div>
      <div>
        loading all
      </div>
    </div>
  `);

  p1.resolve(1);

  await screen.findByText("p1:1");
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div>
        p1:
        1
      </div>
      <div>
        loading all
      </div>
    </div>
  `);

  p2.resolve(2);
  await screen.findByText("sum:3");
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div>
        p1:
        1
      </div>
      <div>
        sum:
        3
      </div>
    </div>
  `);
});

test("state update inside", async () => {
  function Component({ p1, p2 }: { p1: Promise<number>; p2: Promise<number> }) {
    const [count, setCount] = useState(0);
    const promise = suspendAll([p1, p2]);

    return (
      <>
        <button onClick={() => setCount(count + 1)}>count:{count}</button>
        <Await resolve={promise}>{([x, y]) => <div>{x + y}</div>}</Await>
      </>
    );
  }

  const p1 = new Deferred<number>();
  const p2 = new Deferred<number>();

  render(
    <Suspense fallback={<div>loading</div>}>
      <Component p1={p1.promise} p2={p2.promise} />
    </Suspense>
  );

  expect(screen.getByText("loading")).toBeTruthy();
  p1.resolve(1);
  expect(screen.getByText("loading")).toBeTruthy();
  p2.resolve(2);

  await screen.findByText("3");
  fireEvent.click(screen.getByText("count:0"));
  expect(screen.getByText("count:1")).toBeTruthy();
});
