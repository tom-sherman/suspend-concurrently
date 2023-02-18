# Suspend Concurrently

Promise concurrency primitives for React Suspense.

- `suspendAll(promises)`
- `suspendRace(promises)`
- `suspendAny(promises)`
- `suspendAllSettled(promises)`

These work just like the `Promise.all`, `Promise.race`, `Promise.any`, and `Promise.allSettled` methods, but are suitable to be used inside of React 18. See the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency) for more information.

## Usage

These utilities are intended to be used with Remix's deferred data APIs, but they can also be used anywhere you need to compose multiple promises together and resolve them concurrently.

In remix:

```jsx
export function loader() {
  return defer({
    deferredUserName: fetchUserName(),
    deferredUserAvatar: fetchUserAvatar(),
  });
}

export default function UserRoute() {
  const {deferredUserName, deferredUserAvatar} = useLoaderData();
  const userPromise = usePromiseAll([deferredUserName, deferredUserAvatar]);

  return (
    <Suspense fallback={<Loading />}>
      <Await resolve={userPromise}>
        {([name, avatar]) => (
          <div>
            <img src={avatar} />
            <h1>{name}</h1>
          </div>
        )}
      </Await>
    </Suspense>
  );
}
```
