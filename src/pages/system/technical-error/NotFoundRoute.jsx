export function NotFoundRoute() {
  throw new Response('Page not found.', {
    status: 404,
    statusText: 'Page not found',
  })
}
