export const metadata = {
  title: 'Privacy Policy - Weelp',
  description:
    'Learn how Weelp collects, uses, and protects your personal information when you use our travel booking platform.',
};

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const SectionTitle = ({ children }) => (
  <h2
    className="text-2xl font-semibold text-[#243141]"
    style={{ fontFamily: fontIT }}
  >
    {children}
  </h2>
);

const Paragraph = ({ children }) => (
  <p
    className="text-lg text-[#6f7680] leading-relaxed"
    style={{ fontFamily: fontIT, fontWeight: 500 }}
  >
    {children}
  </p>
);

const BulletList = ({ items }) => (
  <ul className="list-disc list-inside space-y-2">
    {items.map((item, index) => (
      <li
        key={index}
        className="text-lg text-[#6f7680] leading-relaxed"
        style={{ fontFamily: fontIT, fontWeight: 500 }}
      >
        {item}
      </li>
    ))}
  </ul>
);

const PrivacyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <p className="text-sm text-[#6f7680]">Last updated: April 4, 2026</p>
      <h1
        className="text-4xl font-bold text-[#243141] md:text-5xl mt-4 mb-12"
        style={{ fontFamily: fontIT }}
      >
        Privacy Policy
      </h1>

      <div className="space-y-10">
        {/* 1. Introduction */}
        <section className="space-y-4">
          <SectionTitle>Introduction</SectionTitle>
          <Paragraph>
            Weelp operates a travel booking platform that connects travellers with
            experiences, activities, and holiday packages around the world. We are
            committed to protecting your privacy and handling your personal
            information with transparency and care.
          </Paragraph>
          <Paragraph>
            By accessing or using our platform, you agree to the collection and use
            of information in accordance with this Privacy Policy. If you do not
            agree with any part of this policy, please do not use our services.
          </Paragraph>
        </section>

        {/* 2. Information We Collect */}
        <section className="space-y-4">
          <SectionTitle>Information We Collect</SectionTitle>
          <Paragraph>
            We collect the following categories of information when you use Weelp:
          </Paragraph>
          <BulletList
            items={[
              'Personal information: name, email address, phone number, date of birth, and billing address',
              'Payment information: processed securely via Stripe — we do not store raw card details',
              'Booking details: travel dates, destinations, activity selections, and passenger information',
              'Account data: username, password (hashed), preferences, and saved itineraries',
              'Device and usage data: IP address, browser type, operating system, and pages visited',
              'Cookies and tracking data: session identifiers, analytics events, and referral sources',
            ]}
          />
        </section>

        {/* 3. How We Use Your Information */}
        <section className="space-y-4">
          <SectionTitle>How We Use Your Information</SectionTitle>
          <Paragraph>
            The information we collect is used for the following purposes:
          </Paragraph>
          <BulletList
            items={[
              'Processing bookings and payments on your behalf',
              'Providing customer support and resolving disputes',
              'Sending transactional emails such as booking confirmations and receipts',
              'Sending promotional communications — only with your explicit opt-in consent',
              'Improving and personalising the Weelp platform based on usage patterns',
              'Detecting and preventing fraud, abuse, and security incidents',
              'Complying with applicable legal and regulatory obligations',
            ]}
          />
        </section>

        {/* 4. Information Sharing */}
        <section className="space-y-4">
          <SectionTitle>Information Sharing</SectionTitle>
          <Paragraph>
            We do <strong>not</strong> sell, rent, or trade your personal data to
            third parties. We may share your information only in the following
            circumstances:
          </Paragraph>
          <BulletList
            items={[
              'Travel partners and activity providers: to fulfil your bookings',
              'Stripe: our payment processor, to handle transactions securely',
              'Analytics providers: to help us understand platform usage (data is aggregated or anonymised where possible)',
              'Legal authorities: when required by law, court order, or to protect the rights and safety of users',
              'Business transfers: in the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction',
            ]}
          />
        </section>

        {/* 5. Data Security */}
        <section className="space-y-4">
          <SectionTitle>Data Security</SectionTitle>
          <Paragraph>
            We implement industry-standard security measures to protect your
            personal information, including:
          </Paragraph>
          <BulletList
            items={[
              'SSL/TLS encryption for all data in transit',
              'Encrypted storage for sensitive data at rest',
              'PCI-compliant payment partners to safeguard financial information',
              'Role-based access controls limiting who can view personal data internally',
            ]}
          />
          <Paragraph>
            While we are committed to protecting your data, no method of
            transmission over the internet or electronic storage is 100% secure.
            In the event of a data breach, we will act promptly to assess and
            address the impact in accordance with applicable laws.
          </Paragraph>
        </section>

        {/* 6. Your Rights */}
        <section className="space-y-4">
          <SectionTitle>Your Rights</SectionTitle>
          <Paragraph>
            Depending on your location, you may have the following rights
            regarding your personal data:
          </Paragraph>
          <BulletList
            items={[
              'Access: request a copy of the personal data we hold about you',
              'Correction: request that inaccurate or incomplete data be updated',
              'Deletion: request that your personal data be erased (subject to legal obligations)',
              'Opt-out of marketing: unsubscribe from promotional communications at any time',
              'Data portability: receive your data in a structured, machine-readable format',
              'Withdraw consent: where processing is based on consent, you may withdraw it at any time',
            ]}
          />
          <Paragraph>
            To exercise any of these rights, please contact us at{' '}
            <a
              href="mailto:privacy@weelp.com"
              className="text-[#243141] underline hover:opacity-80"
            >
              privacy@weelp.com
            </a>
            . We will respond to all requests within 30 days.
          </Paragraph>
        </section>

        {/* 7. Cookies */}
        <section className="space-y-4">
          <SectionTitle>Cookies</SectionTitle>
          <Paragraph>
            We use cookies and similar tracking technologies on our platform.
            These fall into three categories:
          </Paragraph>
          <BulletList
            items={[
              'Essential cookies: required for authentication and platform security — cannot be disabled',
              'Analytics cookies: help us understand how users interact with the platform',
              'Marketing cookies: used for targeted advertising, enabled only with your consent',
            ]}
          />
          <Paragraph>
            You can manage your cookie preferences through your browser settings.
            Please note that disabling essential cookies may affect the
            functionality of certain features on the platform.
          </Paragraph>
        </section>

        {/* 8. Children's Privacy */}
        <section className="space-y-4">
          <SectionTitle>Children&apos;s Privacy</SectionTitle>
          <Paragraph>
            Weelp is not intended for use by individuals under the age of 16. We
            do not knowingly collect personal information from children. If we
            become aware that a child under 16 has provided us with personal data,
            we will take immediate steps to delete that information from our
            systems. If you believe a child has submitted personal information to
            us, please contact us at{' '}
            <a
              href="mailto:privacy@weelp.com"
              className="text-[#243141] underline hover:opacity-80"
            >
              privacy@weelp.com
            </a>
            .
          </Paragraph>
        </section>

        {/* 9. Changes to This Policy */}
        <section className="space-y-4">
          <SectionTitle>Changes to This Policy</SectionTitle>
          <Paragraph>
            We may update this Privacy Policy from time to time to reflect changes
            in our practices, technology, or legal requirements. When we do, we
            will notify you by updating the policy on this page and revising the
            &quot;Last updated&quot; date at the top. Your continued use of Weelp
            following any changes constitutes your acceptance of the updated
            policy.
          </Paragraph>
          <Paragraph>
            We encourage you to review this page periodically to stay informed
            about how we are protecting your information.
          </Paragraph>
        </section>

        {/* 10. Contact Us */}
        <section className="space-y-4">
          <SectionTitle>Contact Us</SectionTitle>
          <Paragraph>
            If you have any questions, concerns, or requests regarding this Privacy
            Policy or the way we handle your personal data, please reach out to us
            at{' '}
            <a
              href="mailto:privacy@weelp.com"
              className="text-[#243141] underline hover:opacity-80"
            >
              privacy@weelp.com
            </a>
            . We are here to help.
          </Paragraph>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
