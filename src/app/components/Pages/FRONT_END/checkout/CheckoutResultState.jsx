import NavigationLink from '@/app/components/Navigation/NavigationLink';

const toneClasses = {
  success: 'border-weelp-sage-deep bg-weelp-sage-wash',
  warning: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30',
  danger: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
  neutral: 'border-border bg-card',
};

export function ResultActionLink({ href, children, emphasis = 'secondary' }) {
  const emphasisClass =
    emphasis === 'primary'
      ? 'border-weelp-sage-deep bg-weelp-sage-deep text-white hover:bg-background hover:text-foreground'
      : 'border-border bg-background text-foreground hover:border-weelp-sage-deep';

  return (
    <NavigationLink
      href={href}
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-2 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2 sm:w-auto ${emphasisClass}`}
    >
      {children}
    </NavigationLink>
  );
}

export function ResultActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-weelp-sage-deep bg-weelp-sage-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2 sm:w-auto"
    >
      {children}
    </button>
  );
}

export default function CheckoutResultState({ title, description, tone = 'neutral', actions, children }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-10 sm:px-6">
      <section className={`w-full max-w-3xl min-w-0 rounded-2xl border p-5 shadow-sm sm:p-8 ${toneClasses[tone] ?? toneClasses.neutral}`}>
        <div className="min-w-0 space-y-3">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="max-w-2xl break-words text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        </div>

        {children ? <div className="mt-6 min-w-0">{children}</div> : null}
        {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </section>
    </main>
  );
}
