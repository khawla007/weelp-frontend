import Image from 'next/image';

// This file allows you to provide custom React components to be used in MDX files.
// You can import and use any React component you want, including inline styles, components from other libraries, and more.

const components = {
  // Allows customizing built-in components, e.g. to add styling.
  h1: ({ children }) => <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">{children}</h1>,

  h2: ({ children }) => <h2 className="text-3xl font-semibold text-gray-800 sm:text-4xl mb-3">{children}</h2>,

  h3: ({ children }) => <h3 className="text-2xl font-medium text-gray-700 sm:text-3xl mb-3">{children}</h3>,

  p: ({ children }) => <p className="text-lg text-gray-800 leading-relaxed mb-4">{children}</p>,

  ul: ({ children }) => <ul className="list-inside list-disc space-y-2 mb-4">{children}</ul>,

  ol: ({ children }) => <ol className="list-inside list-decimal space-y-2 mb-4">{children}</ol>,

  li: ({ children }) => <li className="text-gray-700">{children}</li>,

  img: (props) => <Image {...props} alt={props.alt || 'Image'} className="rounded-lg shadow-lg object-cover w-full h-auto mb-6" sizes="(max-width: 768px) 100vw, 50vw" />,

  a: ({ children, href }) => (
    <a href={href} className="text-blue-500 hover:text-blue-700 transition-colors duration-300">
      {children}
    </a>
  ),

  pre: ({ children }) => <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">{children}</pre>,

  code: ({ children }) => <code className="bg-gray-200 text-gray-800 rounded px-1 py-0.5">{children}</code>,

  blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,

  hr: () => <hr className="border-t-2 border-gray-300 my-8" />,

  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
};

export function useMDXComponents() {
  return components;
}
