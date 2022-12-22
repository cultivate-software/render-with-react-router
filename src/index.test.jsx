import { render } from '@render-with/decorators'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from 'react-router-dom'
import { Page, withLocation, withRouter, withRouting } from './index'

describe('withRouter', () => {
  it('decorates component that requires router with router', () => {
    render(<Page name='Home' />, withRouter())
    expect(screen.getByRole('main', { name: /home/i })).toBeInTheDocument()
  })

  it('sets current location to root path', () => {
    render(<Page name='Home' />, withRouter())
    expect(screen.getByRole('link', { name: '/' })).toBeInTheDocument()
  })
})

describe('withLocation', () => {
  it('decorates component that requires router with router', () => {
    render(<Page name='Home' />, withRouter())
    expect(screen.getByRole('main', { name: /home/i })).toBeInTheDocument()
  })

  it('sets current location to root path when no path is given', () => {
    render(<Page name='Home' />, withLocation())
    expect(screen.getByRole('link', { name: '/' })).toBeInTheDocument()
  })

  it('sets current location to given path', () => {
    render(<Page name='FAQ' />, withLocation('/faq'))
    expect(screen.getByRole('link', { name: '/faq' })).toBeInTheDocument()
  })

  it('resolves path params', () => {
    render(<Page name='User Roles' />, withLocation('/users/:userId/roles/:roleId', { userId: 'u1', roleId: 'r2' }))
    expect(screen.getByRole('link', { name: '/users/u1/roles/r2' })).toBeInTheDocument()
  })

  it('asserts path starts with slash', () => {
    render(<Page name='FAQ' />, withLocation('faq'))
    expect(screen.getByRole('link', { name: '/faq' })).toBeInTheDocument()
  })
})

describe('withRouting', () => {
  it('decorates component that requires router with router and current route', () => {
    render(<Link to='/home'>Home</Link>, withRouting())
    expect(screen.getByRole('main', { name: /current/i })).toBeInTheDocument()
  })

  it('sets current location to current path when no path is given', () => {
    render(<Link to='/home'>Home</Link>, withRouting())
    expect(screen.getByRole('link', { name: '/current' })).toBeInTheDocument()
  })

  it('sets current location to given path', () => {
    render(<Link to='/home'>Home</Link>, withRouting({ path: 'faq' }))
    expect(screen.getByRole('main', { name: /current/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '/faq' })).toBeInTheDocument()
  })

  it('sets current page name to given name', () => {
    render(<Link to='/home'>Home</Link>, withRouting({ name: 'FAQ' }))
    expect(screen.getByRole('main', { name: /faq/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '/current' })).toBeInTheDocument()
  })

  it('sets current location to root page when path is root path', () => {
    render(<Link to='/home'>Home</Link>, withRouting({ path: '/' }))
    expect(screen.getByRole('main', { name: /root/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '/' })).toBeInTheDocument()
  })

  it('resolves path params', () => {
    render(<Link to='/home'>Home</Link>, withRouting({ path: '/users/:userId', params: { userId: 'u1' } }))
    expect(screen.getByRole('main', { name: /current/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '/users/u1' })).toBeInTheDocument()
  })

  it('asserts path starts with slash', () => {
    render(<Link to='/home'>Home</Link>, withRouting({ path: 'faq' }))
    expect(screen.getByRole('link', { name: '/faq' })).toBeInTheDocument()
  })

  describe('navigation', () => {
    it('shows configured page when navigating to configured route', async () => {
      render(<Link to='/faq'>FAQ</Link>, withRouting({ routes: { faq: 'FAQ' } }))
      await userEvent.click(screen.getByRole('link', { name: /faq/i }))
      expect(screen.getByRole('main', { name: /faq/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '/faq' })).toBeInTheDocument()
    })

    it('shows configured page when navigating to configured subroute', async () => {
      render(<Link to='/user/details'>Details</Link>, withRouting({ path: '/user', subroutes: { details: 'Details' } }))
      await userEvent.click(screen.getByRole('link', { name: /details/i }))
      expect(screen.getByRole('main', { name: /details/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '/user/details' })).toBeInTheDocument()
    })

    it('shows previous page when navigating back in history', async () => {
      render(<Link to={-1}>Back</Link>, withRouting())
      await userEvent.click(screen.getByRole('link', { name: /back/i }))
      expect(screen.getByRole('main', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/previous')
    })

    it('shows next page when navigating forward in history', async () => {
      render(<Link to={+1}>Forward</Link>, withRouting())
      await userEvent.click(screen.getByRole('link', { name: /forward/i }))
      expect(screen.getByRole('main', { name: /next/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/next')
    })

    it('shows other page when navigating to unsupported route', async () => {
      render(<Link to='/unsupported-route'>Unknown</Link>, withRouting())
      await userEvent.click(screen.getByRole('link', { name: /unknown/i }))
      expect(screen.getByRole('main', { name: /other/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '/unsupported-route' })).toBeInTheDocument()
    })
  })
})