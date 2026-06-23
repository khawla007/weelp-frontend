export const metadata = {
  title: 'Terms of Service - Weelp',
  description: 'Read the Terms of Service for using the Weelp travel booking platform, including rules for bookings, payments, user responsibilities, and more.',
};

const SectionTitle = ({ children }) => <h2 className="text-2xl font-semibold">{children}</h2>;

const Paragraph = ({ children }) => <p className="text-lg text-muted-foreground leading-relaxed font-medium">{children}</p>;

const BulletList = ({ items }) => (
  <ul className="list-disc list-inside space-y-2">
    {items.map((item, index) => (
      <li key={index} className="text-lg text-muted-foreground leading-relaxed font-medium">
        {item}
      </li>
    ))}
  </ul>
);

const TermsPage = () => {
  return (
    <div className="container-page py-10 md:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-muted-foreground">Last updated: April 4, 2026</p>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-12">Terms of Service</h1>

        <div className="space-y-10">
          <section className="space-y-4">
            <SectionTitle>Acceptance of Terms</SectionTitle>
            <Paragraph>
              By accessing or using Weelp (&quot;Platform&quot;), you agree to be bound by these Terms of Service. These Terms apply to all visitors, users, creators, and vendors who access or use the
              Platform. If you do not agree to these Terms, please do not use the Platform.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Definitions</SectionTitle>
            <BulletList
              items={[
                '"Platform" refers to the Weelp website, mobile applications, and all associated services',
                '"User" refers to any individual who browses or makes bookings on the Platform',
                '"Creator" refers to individuals or businesses that list activities and experiences on the Platform',
                '"Vendor" refers to service providers including transfers, accommodation, and local operators',
                '"Booking" refers to any reservation or purchase made through the Platform',
                '"Content" refers to text, images, reviews, itineraries, and any other material submitted to the Platform',
              ]}
            />
          </section>

          <section className="space-y-4">
            <SectionTitle>Account Registration</SectionTitle>
            <Paragraph>
              To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your
              account information up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must be at
              least 18 years of age to create an account and use the Platform.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Bookings and Payments</SectionTitle>
            <Paragraph>
              All prices displayed on the Platform are in the indicated currency. Applicable taxes are included in the displayed price unless otherwise stated. Payments are processed securely via
              Stripe.
            </Paragraph>
            <BulletList
              items={[
                'A booking is confirmed only after successful payment and receipt of a confirmation email',
                'Weelp acts as a marketplace facilitator and is not the direct provider of travel services',
                'Pricing for activities and services is set by individual creators and vendors',
                'Currency conversion, where applicable, is handled by your payment provider',
              ]}
            />
          </section>

          <section className="space-y-4">
            <SectionTitle>User Responsibilities</SectionTitle>
            <BulletList
              items={[
                'Provide accurate and complete information when making bookings',
                'Ensure you hold valid travel documents required for your destination',
                'Arrive on time for all booked activities and services',
                'Comply with all applicable local laws and regulations',
                'Obtain adequate travel insurance for your trip',
                'Refrain from using the Platform for any unlawful or prohibited purpose',
              ]}
            />
          </section>

          <section className="space-y-4">
            <SectionTitle>Creator and Vendor Terms</SectionTitle>
            <Paragraph>
              Creators and vendors are solely responsible for the accuracy of their listings, including descriptions, pricing, availability, and photos. All creators and vendors must maintain valid
              licenses, insurance, and safety standards required by applicable laws and regulations. Weelp reserves the right to remove any listing that violates our guidelines or has received
              consistently poor reviews from users.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Cancellations and Refunds</SectionTitle>
            <Paragraph>
              Cancellation and refund eligibility is governed by our{' '}
              <a href="/cancellation" className="text-foreground underline hover:no-underline">
                Cancellation Policy
              </a>
              . By completing a booking on the Platform, you agree to the terms set out in that policy.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Intellectual Property</SectionTitle>
            <Paragraph>
              All content on the Platform created by Weelp, including but not limited to text, graphics, logos, and software, is the property of Weelp and is protected by applicable copyright and
              trademark laws. For content submitted by users, you retain ownership of your content but grant Weelp a non-exclusive, worldwide, royalty-free license to use, display, and distribute that
              content in connection with operating and improving the Platform.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Limitation of Liability</SectionTitle>
            <Paragraph>
              Weelp operates as a marketplace platform and is not the direct provider of any travel services, activities, or accommodations. Weelp is not liable for the actions, omissions, or
              negligence of creators or vendors. To the maximum extent permitted by applicable law, Weelp&apos;s total liability to you in connection with any claim arising from your use of the
              Platform shall not exceed the amount you paid for the specific booking giving rise to that claim.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Dispute Resolution</SectionTitle>
            <Paragraph>
              If you have a dispute related to a booking or service, please contact our support team first. We will make reasonable efforts to resolve your concern within 14 business days. If a
              resolution cannot be reached through our support process, disputes shall be governed by applicable laws, and both parties agree to attempt mediation in good faith before initiating any
              formal legal action.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Modifications to Terms</SectionTitle>
            <Paragraph>
              Weelp reserves the right to modify these Terms of Service at any time. We will notify you of changes by updating this page with a revised &quot;Last updated&quot; date. Your continued
              use of the Platform following the posting of any changes constitutes your acceptance of the revised Terms.
            </Paragraph>
          </section>

          <section className="space-y-4">
            <SectionTitle>Contact Information</SectionTitle>
            <Paragraph>If you have any questions about these Terms of Service, please contact our legal team at legal@weelp.com.</Paragraph>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
