import PropTypes from 'prop-types'
import { generatePath, MemoryRouter as RouterProvider, Route, Routes, useLocation } from 'react-router-dom'

const assertRoot = path => path[0] === '/' ? path : `/${path}`

const resolvePathParams = params => path => assertRoot(generatePath(path, params))

const resolveInitialEntries = (paths, params) => ({
  initialEntries: paths.map(resolvePathParams(params)),
  initialIndex: paths.length - 1,
})

export const Page = ({ name, children }) => {
  const location = useLocation()
  const url = location.pathname + location.search
  return (
    <main aria-label={name}>
      {children}
      <nav aria-label='Breadcrumb'><a href={url} aria-current='page'>{url}</a></nav>
    </main>
  )
}

Page.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
}

export const withLocation = (path = '/', params = {}) => node =>
  <RouterProvider {...resolveInitialEntries([ assertRoot(path) ], params)}>{node}</RouterProvider>

export const withRouter = () => withLocation('/')

export const withRouting = ({
  name = 'Current Page',
  path = '/current',
  params = {},
  routes = {},
  subroutes = {},
} = {}) => node =>
  <RouterProvider initialEntries={[ '/previous', assertRoot(generatePath(path, params)), '/next' ]} initialIndex={1}>
    <Routes>
      <Route path='/' element={<Page name='Root Page' />} />
      <Route path='previous' element={<Page name='Previous Page' />} />
      <Route path={`${path}/*`} element={<Page name={name}>{node}</Page>} />
      {Object.keys(subroutes).map(subpath =>
        <Route key={subpath} path={`${path}/${subpath}`} element={<Page name={subroutes[subpath]} />} />)}
      <Route path='next' element={<Page name='Next Page' />} />
      {Object.keys(routes).map(path => <Route key={path} path={path} element={<Page name={routes[path]} />} />)}
      <Route path='*' element={<Page name='Other Page' />} />
    </Routes>
  </RouterProvider>