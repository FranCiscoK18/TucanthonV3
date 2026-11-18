import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

/** Pantalla de respaldo si una vista falla al renderizar. */
export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} · ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Error desconocido.';
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-6 py-16">
      <img src="/brand/ondara-logo.png" alt="Ondara" width={720} height={189} className="h-10 w-auto self-start" />
      <h1 className="text-[2rem]">Algo salió mal en esta vista</h1>
      <p className="leading-relaxed text-muted">
        La DEMO encontró un error inesperado. Puedes volver al inicio; tus datos locales no se pierden.
      </p>
      <pre className="relative overflow-x-auto rounded-[12px] bg-border-mist p-3 text-sm">{message}</pre>
      <Link className="btn btn-primary self-start" to="/">
        Volver al inicio
      </Link>
    </main>
  );
}
