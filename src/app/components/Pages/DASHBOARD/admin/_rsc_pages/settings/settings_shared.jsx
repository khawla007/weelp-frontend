import { ArrowLeft } from 'lucide-react';

export const PageInfo = ({ pageTitle, pageDescription }) => {
  return (
    <div>
      {pageTitle && <h2 className="capitalize text-2xl font-bold tracking-tight">{pageTitle}</h2>}
      {pageDescription && <p className="first-letter:capitalize text-muted-foreground">{pageDescription}</p>}
    </div>
  );
};
