import Link from "next/link";

export function FinalEmpireCta({
  kicker,
  title,
  body,
  actionLabel,
  href,
}: {
  kicker: string;
  title: string;
  body: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <section className="empire-closing" aria-labelledby="empire-closing-title">
      <div className="container empire-closing-shell">
        <p className="empire-section-kicker empire-closing-kicker">{kicker}</p>

        <h2 id="empire-closing-title" className="empire-closing-title">
          {title}
        </h2>

        <p className="empire-closing-body">{body}</p>

        <Link href={href} className="empire-closing-action">
          <span>{actionLabel}</span>
          <b aria-hidden="true">→</b>
        </Link>

        <p className="empire-closing-background" aria-hidden="true">
          WEB EMPIRE
        </p>

        <span className="empire-closing-mark" aria-hidden="true">
          ♛
        </span>
      </div>
    </section>
  );
}
