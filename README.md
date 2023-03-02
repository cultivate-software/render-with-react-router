# Render decorators 🪆 for React Router

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/cultivate-software/render-with-react-router/release.yml?branch=main)
![Code Coverage](docs/coverage-badge.svg)
![npm (scoped)](https://img.shields.io/npm/v/@render-with/react-router)
![NPM](https://img.shields.io/npm/l/@render-with/react-router)
![PRs welcome](https://img.shields.io/badge/PRs-welcome-bright%20green)
[![All Contributors](https://img.shields.io/github/all-contributors/cultivate-software/render-with-decorators?color=orange)](#contributors)

Use one of these decorators if your component under test requires a [React Router](https://reactrouter.com/en/main):

- `withRouter()`
- `withLocation(..)`
- `withRouting(..)`

Example:

```jsx
import { render, screen, withLocation } from './test-utils'

it('shows login page', () => {
  render(<App />, withLocation('/login'))
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
})
```

_Note: Refer to the [core library](https://github.com/cultivate-software/render-with-decorators) to learn more about how decorators can simplify writing tests for React components with [React Testing Library](https://www.npmjs.com/package/@testing-library/react)._

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Guiding Principle](#guiding-principle)
- [Test Scenarios](#test-scenarios)
- [API](#api)
- [Issues](#issues)
- [Changelog](#changelog)
- [Contributors](#contributors)
- [LICENSE](#license)

## Installation

This library is distributed via [npm](https://www.npmjs.com/), which is bundled with [node](https://nodejs.org/) and should be installed as one of your project's `devDependencies`.

First, install the [core library](https://github.com/cultivate-software/render-with-decorators) with a render function that supports decorators:

```shell
npm install --save-dev @render-with/decorators
```

Next, install the React Router decorators provided by this library:

```shell
npm install --save-dev @render-with/react-router
```

or

for installation via [yarn](https://classic.yarnpkg.com/):

```shell
yarn add --dev @render-with/decorators
yarn add --dev @render-with/react-router
```

This library has the following `peerDependencies`:

![npm peer dependency version](https://img.shields.io/npm/dependency-version/@render-with/react-router/peer/react-router-dom)

and supports the following `node` versions:

![node-current (scoped)](https://img.shields.io/node/v/@render-with/react-router)

## Setup

In your test-utils file, re-export the render function that supports decorators and the React Router decorators:

```javascript
// test-utils.js
// ...
export * from '@testing-library/react'    // makes all React Testing Library's exports available
export * from '@render-with/decorators'   // overrides React Testing Library's render function
export * from '@render-with/react-router' // makes decorators like withLocation(..) available
```

And finally, use the React Router decorators in your tests:

```jsx
import { render, screen, withLocation } from './test-utils'

it('shows login page', () => {
  render(<App />, withLocation('/login'))
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
})
```

## Guiding Principle

React Router 6 made it very hard to inspect the current location in tests. It takes some time to get used to, but it turns out to be a good change as it supports Testing-Library's guiding principle:

> The more your tests resemble the way your software is used, the more confidence they can give you.

An actual end-user does **not** look at the URL while using a web app. They look at what the browser presents to them. 

A bad workaround has been spreading in the wild that involves mocking React Router hooks like `useNavigate`.

We do not recommend mocking hooks. It ties the tests to implementation details and, besides other downsides, makes refactoring harder.

Instead, we recommend using the decorators in this library.

## Test Scenarios

### Just need a Router?

If your test does not care about the current location, history, or navigation, you can use `withRouter()`. The decorator will create and use a `MemoryRouter` for you and initialize the current location with `/`:

```jsx
import { useNavigate } from 'react-router'

export const Page = () => {
  const navigate = useNavigate()
  return (
    <>
      <h1>Page</h1>
      <button onClick={() => navigate(-1)}>Go back</button>
    </>
  )
}
```

```jsx
import { render, screen, withRouter } from './test-utils'

it('uses given name as heading', () => {
  render(<Page />, withRouter())
  expect(screen.getByRole('heading', { name: /page/i })).toBeInTheDocument()
})
```

### Need to provide a specific path or verify the handling of query params?

If your component cares about a certain path or your test cares about the handling of certain query params, you can use the `withLocation(..)` decorator:

```jsx
import { Routes, Route } from 'react-router'

export const App = () => (
  <Routes>
    <Route path='/' element={<h1>Homepage</h1>} />
    <Route path='/product' element={<h1>Products</h1>} />
  </Routes>
)
```

```jsx
import { render, screen, withLocation } from './test-utils'

it('shows product page', () => {
  render(<App />, withLocation('/product'))
  expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument()
})
```

The `withLocation` decorator also supports path params in case your project uses routes with variable parts:

```jsx
import { Routes, Route } from 'react-router'

export const App = () => (
  <Routes>
    <Route path='/' element={<h1>Homepage</h1>} />
    <Route path='/users/:userId' element={<h1>User</h1>} />
  </Routes>
)
```

```jsx
import { render, screen, withLocation } from './test-utils'

it('shows user page', () => {
  render(<App />, withLocation('/users/:userId', { userId: '42' }))
  expect(screen.getByRole('heading', { name: /user/i })).toBeInTheDocument()
})
```

### Need to verify navigational changes?

If your test cares about navigation and location, you can use the versatile `withRouting(..)` decorator.

#### Current Page

The component under test is not just rendered within `MemoryRouter` but also within a small page wrapper component that identifies the current page by name and the current location by rendering a simplified breadcrumb:  

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows current page and location', async () => {
  render(<div>Test</div>, withRouting())
  expect(screen.getByRole('main', { name: /current page/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/current')
})
```

#### Other Page

The decorator provides a catch-all route that renders an "Other Page" in case the target route does not exist.

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows other page and location', async () => {
  render(<Link to='/users'>Users</Link>, withRouting())
  await userEvent.click(screen.getByRole('link', { name: /users/i }))
  expect(screen.getByRole('main', { name: /other page/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/users')
})
```

#### Previous Page

The decorator provides a "Previous Page" and sets up the history accordingly:

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows previous page and location', async () => {
  render(<Link to={-1}>Back</Link>, withRouting())
  await userEvent.click(screen.getByRole('link', { name: /back/i }))
  expect(screen.getByRole('main', { name: /previous page/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/previous')
})
```

#### Next Page

The decorator provides a "Next Page" and sets up the history accordingly:

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows next page and location', async () => {
  render(<Link to={+1}>Next</Link>, withRouting())
  await userEvent.click(screen.getByRole('link', { name: /next/i }))
  expect(screen.getByRole('main', { name: /next page/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/next')
})
```

#### Routes

You can configure the decorator with one or more routes. This can be useful if user interaction with the component under test results in navigational changes away from the current location to a different route:

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows next page and location', async () => {
  render(<Link to='/users'>Customers</Link>, withRouting({ routes: { users: 'Customers' } }))
  await userEvent.click(screen.getByRole('link', { name: /customers/i }))
  expect(screen.getByRole('main', { name: /customers/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/users')
})
```

#### Subroutes

You can configure the decorator with one or more subroutes. This can be useful if user interaction with the component under test results in navigational changes away from the current location to a subroute:

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows next page and location', async () => {
  render(<Link to='/current/details'>More</Link>, withRouting({ subroutes: { details: 'More' } }))
  await userEvent.click(screen.getByRole('link', { name: /more/i }))
  expect(screen.getByRole('main', { name: /more/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/current/details')
})
```

#### Current path

You can also configure the current path and current page name: 

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows current page and location', async () => {
  render(<div>Test</div>, withRouting({ path: '/users', name: 'Users' }))
  expect(screen.getByRole('main', { name: /users/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/users')
})
```

#### Path params

The decorator supports path params in the current path in case your project uses routes with variable parts:

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows current page and location', async () => {
  render(<div>Test</div>, withRouting({ path: '/users/:userId', params: { userId: '42' } }))
  expect(screen.getByRole('main', { name: /current/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/users/42')
})
```

Routes and subroutes can also have path params that React Router will resolve:

```jsx
import { render, screen, withRouting } from './test-utils'

it('shows current page and location', async () => {
  render(<Link to='/users/42'>John</Link>, withRouting({ routes: { ['/users/:userId']: 'User' } }))
  await userEvent.click(screen.getByRole('link', { name: /john/i }))
  expect(screen.getByRole('main', { name: /user/i })).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/users/42')
})
```

## API

_Note: This API reference uses simplified types. You can find the full type specification [here](https://github.com/cultivate-software/render-with-react-router/blob/main/types/index.d.ts)._

```
function withRouter(): Decorator
```

Wraps component under test in a `MemoryRouter` and initializes location with `/`.

```
function withLocation(path?: string, params?: Params): Decorator
```

Wraps component under test in a `MemoryRouter` and initializes location with the given path. Resolves path parameters with the given values.

```
function withRouting(options?: {
  name?: string,
  path?: string,
  params?: Params,
  routes?: Routes,
  subroutes?: Routes
}): Decorator
```

Wraps component under test in a `MemoryRouter` and a simples `Routes` infrastructure with routes history for the Current page, a Previous page, and a Next page. Supports a custom path and name for the current page and additional routes and subroutes.

```
type Params = { [param: string]: string }
```

Maps path parameter names to parameter values.

```
type Routes = { [route: string]: string }
```

Maps routes to page names.

## Issues

Looking to contribute? PRs are welcome. Checkout this project's [Issues](https://github.com/cultivate-software/render-with-react-router/issues?q=is%3Aissue+is%3Aopen) on GitHub for existing issues.

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[See Bugs](https://github.com/cultivate-software/render-with-react-router/issues?q=is%3Aissue+label%3Abug+is%3Aopen+sort%3Acreated-desc)

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding a 👍. This helps maintainers prioritize what to work on.

[See Feature Requests](https://github.com/cultivate-software/render-with-react-router/issues?q=is%3Aissue+label%3Aenhancement+sort%3Areactions-%2B1-desc+is%3Aopen)

### 📚 More Libraries

Please file an issue on the core project to suggest additional libraries that would benefit from decorators. Vote on library support adding a 👍. This helps maintainers prioritize what to work on.

[See Library Requests](https://github.com/cultivate-software/render-with-decorators/issues?q=is%3Aissue+label%3Alibrary+sort%3Areactions-%2B1-desc+is%3Aopen)

### ❓ Questions

For questions related to using the library, file an issue on GitHub.

[See Questions](https://github.com/cultivate-software/render-with-react-router/issues?q=is%3Aissue+label%3Aquestion+sort%3Areactions-%2B1-desc)

## Changelog

Every release is documented on the GitHub [Releases](https://github.com/cultivate-software/render-with-react-router/releases) page.

## Contributors

Thanks goes to these people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://cultivate.software"><img src="https://avatars.githubusercontent.com/u/31018345?v=4?s=100" width="100px;" alt="cultivate(software)"/><br /><sub><b>cultivate(software)</b></sub></a><br /><a href="#business-cultivate(software)" title="Business development">💼</a> <a href="#financial-cultivate(software)" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/davidbieder"><img src="https://avatars.githubusercontent.com/u/9366720?v=4?s=100" width="100px;" alt="David Bieder"/><br /><sub><b>David Bieder</b></sub></a><br /><a href="https://github.com/cultivate-software/render-with-decorators/commits?author=davidbieder" title="Code">💻</a> <a href="https://github.com/cultivate-software/render-with-decorators/commits?author=davidbieder" title="Tests">⚠️</a> <a href="https://github.com/cultivate-software/render-with-decorators/commits?author=davidbieder" title="Documentation">📖</a> <a href="https://github.com/cultivate-software/render-with-decorators/pulls?q=is%3Apr+reviewed-by%3Adavidbieder" title="Reviewed Pull Requests">👀</a> <a href="#infra-davidbieder" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-davidbieder" title="Maintenance">🚧</a> <a href="#ideas-davidbieder" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jeromeweiss"><img src="https://avatars.githubusercontent.com/u/59569084?v=4?s=100" width="100px;" alt="Jerome Weiß"/><br /><sub><b>Jerome Weiß</b></sub></a><br /><a href="https://github.com/cultivate-software/render-with-decorators/commits?author=jeromeweiss" title="Documentation">📖</a> <a href="#infra-jeromeweiss" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-jeromeweiss" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mauricereichelt"><img src="https://avatars.githubusercontent.com/u/31188606?v=4?s=100" width="100px;" alt="Maurice Reichelt"/><br /><sub><b>Maurice Reichelt</b></sub></a><br /><a href="https://github.com/cultivate-software/render-with-decorators/commits?author=mauricereichelt" title="Documentation">📖</a> <a href="#infra-mauricereichelt" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-mauricereichelt" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind welcome!

## LICENSE

[MIT](LICENSE)