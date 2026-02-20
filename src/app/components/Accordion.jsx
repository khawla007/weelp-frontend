import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/**
 * @typedef {Object} FAQ
 * @property {string} question - The FAQ question
 * @property {string} answer - The FAQ answer
 */

/**
 * AccordionItems component
 * @param {Object} props - Props object
 * @param {FAQ[]} props.faqs - Array of FAQ objects
 * @returns {JSX.Element} JSX element
 */

export function AccordionItems({ faqs = [] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`} className="mb-4 border border-gray-300 bg-white rounded-2xl shadow-sm overflow-hidden">
          <AccordionTrigger className="w-full flex items-center justify-between p-4 font-semibold text-Nileblue cursor-pointer hover:no-underline">{faq.question}</AccordionTrigger>
          <AccordionContent className="p-4 pt-0 text-black-600 overflow-hidden transition-all duration-300 ease-in-out">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
