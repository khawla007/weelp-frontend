export const metadata = {
  title: 'Cancellation Policy - Weelp',
  description: "Understand Weelp's cancellation and refund policies, including eligibility, timelines, and how to request a cancellation for your booking.",
};

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const SectionTitle = ({ children }) => (
  <h2 className="text-2xl font-semibold text-[#243141]" style={{ fontFamily: fontIT }}>
    {children}
  </h2>
);

const Paragraph = ({ children }) => (
  <p className="text-lg text-[#6f7680] leading-relaxed" style={{ fontFamily: fontIT, fontWeight: 500 }}>
    {children}
  </p>
);

const BulletList = ({ items }) => (
  <ul className="list-disc list-inside space-y-2">
    {items.map((item, index) => (
      <li key={index} className="text-lg text-[#6f7680] leading-relaxed" style={{ fontFamily: fontIT, fontWeight: 500 }}>
        {item}
      </li>
    ))}
  </ul>
);

const CancellationPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <p className="text-sm text-[#6f7680]">Last updated: April 4, 2026</p>
      <h1 className="text-4xl font-bold text-[#243141] md:text-5xl mt-4 mb-12" style={{ fontFamily: fontIT }}>
        Cancellation Policy
      </h1>

      <div className="space-y-10">
        {/* 1. Overview */}
        <section className="space-y-4">
          <SectionTitle>Overview</SectionTitle>
          <Paragraph>Plans can change. This policy outlines the cancellation terms, refund eligibility, timelines, and process for bookings made through the Weelp platform.</Paragraph>
        </section>

        {/* 2. Customer-Initiated Cancellations */}
        <section className="space-y-4">
          <SectionTitle>Customer-Initiated Cancellations</SectionTitle>
          <Paragraph>
            If you need to cancel a booking, the refund amount depends on how far in advance you cancel relative to the activity date. The following tiered refund schedule applies:
          </Paragraph>
          <div className="overflow-x-auto">
            <table className="w-full text-lg text-[#6f7680] border-collapse" style={{ fontFamily: fontIT, fontWeight: 500 }}>
              <thead>
                <tr className="border-b-2 border-[#e3e3e3]">
                  <th className="py-3 pr-6 text-left font-semibold text-[#243141]">Cancellation Window</th>
                  <th className="py-3 text-left font-semibold text-[#243141]">Refund</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e3e3e3a6]">
                  <td className="py-3 pr-6">7 or more days before the activity date</td>
                  <td className="py-3">Full refund minus processing fee (2.9% + $0.30)</td>
                </tr>
                <tr className="border-b border-[#e3e3e3a6]">
                  <td className="py-3 pr-6">3 to 6 days before the activity date</td>
                  <td className="py-3">50% refund</td>
                </tr>
                <tr className="border-b border-[#e3e3e3a6]">
                  <td className="py-3 pr-6">Less than 3 days before the activity date</td>
                  <td className="py-3">No refund</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6">No-show</td>
                  <td className="py-3">No refund</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Paragraph>
            Please note that some activities may have stricter cancellation policies set by the individual creator or vendor. These policies are displayed on the activity listing page and in your
            booking confirmation.
          </Paragraph>
        </section>

        {/* 3. Creator/Vendor-Initiated Cancellations */}
        <section className="space-y-4">
          <SectionTitle>Creator/Vendor-Initiated Cancellations</SectionTitle>
          <Paragraph>
            If a creator or vendor cancels your booking, you are entitled to a full refund or the option to rebook to an alternative date or experience at no additional cost. We will notify you as
            soon as possible and assist you in finding suitable alternatives.
          </Paragraph>
        </section>

        {/* 4. Force Majeure */}
        <section className="space-y-4">
          <SectionTitle>Force Majeure</SectionTitle>
          <Paragraph>
            Cancellations resulting from events beyond reasonable control are covered under our force majeure policy. This includes natural disasters, severe weather conditions, government
            restrictions, pandemics, civil unrest, and transport strikes. In such cases, you will receive a full refund or platform credit valid for 12 months from the date of issue. We understand
            these situations are stressful and we&apos;re committed to making the process as smooth as possible.
          </Paragraph>
        </section>

        {/* 5. Modification Policy */}
        <section className="space-y-4">
          <SectionTitle>Modification Policy</SectionTitle>
          <Paragraph>
            Modifications to date, time, or number of participants are subject to availability. All modification requests must be submitted at least 48 hours before the scheduled activity. The
            following conditions apply:
          </Paragraph>
          <BulletList
            items={[
              'Date or time changes are free of charge if the new slot is available',
              'Adding participants requires an additional payment at the current rate',
              'Reducing the number of participants is treated as a partial cancellation and is subject to the refund schedule above',
              'If the price difference requires a full cancel and rebook, the standard cancellation policy applies',
            ]}
          />
        </section>

        {/* 6. Refund Processing */}
        <section className="space-y-4">
          <SectionTitle>Refund Processing</SectionTitle>
          <Paragraph>
            Approved refunds are processed within 5 to 10 business days and returned to the original payment method used at the time of booking. The exact timing may vary depending on your bank or
            card issuer. You will receive an email confirmation once the refund has been initiated from our end.
          </Paragraph>
        </section>

        {/* 7. Non-Refundable Items */}
        <section className="space-y-4">
          <SectionTitle>Non-Refundable Items</SectionTitle>
          <Paragraph>The following items are non-refundable under all circumstances:</Paragraph>
          <BulletList
            items={[
              'Payment processing fees',
              'Travel insurance purchased through the Platform',
              'Bookings explicitly marked as non-refundable at the time of purchase',
              'Special, promotional, or discounted bookings where non-refundable terms were stated',
              'Gift card or voucher purchases',
            ]}
          />
        </section>

        {/* 8. How to Request a Cancellation */}
        <section className="space-y-4">
          <SectionTitle>How to Request a Cancellation</SectionTitle>
          <Paragraph>To cancel a booking, you may use either of the following methods:</Paragraph>
          <BulletList items={['Log in to your account dashboard and use the "Cancel Booking" option on your booking details page', 'Email us at support@weelp.com with your cancellation request']} />
          <Paragraph>
            Please include your booking reference number in all cancellation requests. Cancellations are effective from the date and time the request is received and confirmed by our team.
          </Paragraph>
        </section>

        {/* 9. Contact Us */}
        <section className="space-y-4">
          <SectionTitle>Contact Us</SectionTitle>
          <Paragraph>
            If you have any questions about this Cancellation Policy or need assistance with a booking, please reach out to us at{' '}
            <a href="mailto:support@weelp.com" className="text-[#243141] underline hover:opacity-80">
              support@weelp.com
            </a>
            . We are here to help.
          </Paragraph>
        </section>
      </div>
    </div>
  );
};

export default CancellationPage;
