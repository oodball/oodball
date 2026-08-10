export function getAuthRedirectUrl(path, query = {}) {
  const isProduction =
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  const base = isProduction
    ? 'https://www.oodball.com'
    : `${window.location.protocol.slice(0, -1)}://${window.location.hostname}${
        window.location.port ? `:${window.location.port}` : ''
      }`;

  const params = new URLSearchParams(query);
  const queryString = params.toString();
  return `${base}${path}${queryString ? `?${queryString}` : ''}`;
}
