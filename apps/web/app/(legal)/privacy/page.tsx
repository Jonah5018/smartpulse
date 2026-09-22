import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SmartPulse",
  description:
    "How SmartPulse collects, uses, protects, and handles personal information.",
};

const sectionClass = "space-y-3";
const headingClass = "text-xl font-semibold text-slate-100";
const textClass = "text-sm leading-7 text-slate-300";
const listClass =
  "list-disc space-y-2 pl-6 text-sm leading-7 text-slate-300";

export default function PrivacyPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          SmartPulse Legal
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>

        <p className={textClass}>
          This Privacy Policy explains how SmartPulse collects,
          uses, stores, and protects personal information.
        </p>

        <p className="text-xs text-slate-500">
          Last updated: 22 September 2026
        </p>
      </header>

      <section className={sectionClass}>
        <h2 className={headingClass}>1. Who operates SmartPulse</h2>

        <p className={textClass}>
          SmartPulse is currently operated by Jonathan Uchenna
          Nwofoke in Nigeria.
        </p>

        <p className={textClass}>
          Privacy enquiries and requests may be sent to
          jonahsmith5018@gmail.com.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>2. Who may use SmartPulse</h2>

        <p className={textClass}>
          SmartPulse is intended only for people who are at least
          18 years old. We do not knowingly offer accounts to
          children.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>3. Information we collect</h2>

        <p className={textClass}>
          The information SmartPulse collects depends on how you
          use the service.
        </p>

        <ul className={listClass}>
          <li>
            Account information, including your first name,
            optional other names, last name, email address, and
            timezone.
          </li>

          <li>
            Trader profile information, including experience
            level, learning mode, trading styles, preferred
            timeframes, market categories, favourite markets,
            goals, and trading challenges.
          </li>

          <li>
            Journal information you choose to save, including
            market, direction, timeframe, trade date, prices,
            notes, lessons, status, and saved analysis snapshots.
          </li>

          <li>
            Authentication and session information required to
            keep you signed in and protect access to your account.
          </li>

          <li>
            Technical and security information that may be
            processed by our infrastructure and authentication
            providers when necessary to operate and protect the
            service.
          </li>
        </ul>

        <p className={textClass}>
          SmartPulse does not store your password in application
          profile or journal tables. Authentication credentials
          are handled through the authentication service.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          4. Why we use personal information
        </h2>

        <ul className={listClass}>
          <li>Create and secure your account.</li>
          <li>Provide your personalised SmartPulse workspace.</li>
          <li>Save your preferences and trading journal.</li>
          <li>Provide learning and market-intelligence features.</li>
          <li>Maintain, troubleshoot, and secure the service.</li>
          <li>
            Comply with applicable legal and regulatory
            obligations.
          </li>
        </ul>

        <p className={textClass}>
          Depending on the processing activity and applicable
          law, processing may be necessary to perform our
          agreement with you, pursue legitimate interests in
          operating and securing SmartPulse, comply with legal
          obligations, or rely on consent where consent is
          required.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          5. Service providers and data sharing
        </h2>

        <p className={textClass}>
          SmartPulse uses third-party infrastructure and data
          services where they are necessary to operate the
          platform.
        </p>

        <ul className={listClass}>
          <li>
            Supabase provides authentication and database
            infrastructure for account, profile, and journal
            information.
          </li>

          <li>
            OpenAI may process market-analysis context when
            SmartPulse generates an AI market explanation. In
            the current implementation, this AI prompt is built
            from market setup and macroeconomic analysis. It is
            not intentionally supplied with your name, email
            address, account profile, or saved journal notes.
          </li>

          <li>
            Market-data and economic-calendar providers receive
            requests needed to retrieve market and calendar
            information. SmartPulse does not intentionally send
            your account identity as part of those market-data
            requests.
          </li>
        </ul>

        <p className={textClass}>
          We do not sell personal information to advertisers.
          SmartPulse currently does not use advertising pixels,
          Meta Pixel, Google Analytics, or email-marketing
          tracking tools.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>6. Cookies and sessions</h2>

        <p className={textClass}>
          SmartPulse currently uses cookies and similar browser
          storage only where necessary for authentication,
          session continuity, security, and essential application
          functionality.
        </p>

        <p className={textClass}>
          We currently do not use advertising or behavioural
          tracking cookies.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          7. International processing
        </h2>

        <p className={textClass}>
          SmartPulse is operated from Nigeria and may use service
          providers that process information in other countries.
          Where data protection law requires safeguards for an
          international transfer, we will take appropriate steps
          for the relevant processing arrangement.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>8. Data retention</h2>

        <p className={textClass}>
          We retain account, profile, and journal information for
          as long as reasonably necessary to provide SmartPulse,
          maintain security and integrity, meet legal
          obligations, resolve disputes, or respond to valid
          requests.
        </p>

        <p className={textClass}>
          Archiving a journal entry does not permanently delete
          it. SmartPulse does not yet provide a complete
          self-service account export or deletion workflow.
          Until those controls are implemented, privacy and
          deletion requests may be sent to
          jonahsmith5018@gmail.com.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>9. Your privacy rights</h2>

        <p className={textClass}>
          Depending on your location and applicable law, you may
          have rights relating to your personal information,
          including rights to information, access, correction,
          deletion, restriction, objection, portability, and
          complaints to an appropriate supervisory authority.
        </p>

        <p className={textClass}>
          You may contact jonahsmith5018@gmail.com to make a
          privacy request. We may need to verify your identity
          before fulfilling a request.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          10. AI and automated analysis
        </h2>

        <p className={textClass}>
          SmartPulse uses deterministic analysis and may use AI
          to explain supplied market evidence. SmartPulse is
          designed to support human decision-making, not to make
          trading decisions or execute trades on your behalf.
        </p>

        <p className={textClass}>
          AI-generated explanations may be incomplete or
          incorrect and should be reviewed critically.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>11. Security</h2>

        <p className={textClass}>
          We use technical and organisational safeguards
          intended to protect personal information, including
          authenticated access controls and database ownership
          rules. No internet-connected service can guarantee
          absolute security.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>12. Changes to this policy</h2>

        <p className={textClass}>
          We may update this Privacy Policy when SmartPulse,
          our providers, our data practices, or applicable laws
          change. Material changes will be reflected by an
          updated effective date and, where appropriate, an
          additional notice.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>13. Contact</h2>

        <p className={textClass}>
          Operator: Jonathan Uchenna Nwofoke
          <br />
          Country: Nigeria
          <br />
          Email: jonahsmith5018@gmail.com
        </p>
      </section>
    </article>
  );
}