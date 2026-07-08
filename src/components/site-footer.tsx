import type { SiteIdentity } from "@/localization/types";

export function SiteFooter({ identity }: { identity: SiteIdentity }) {
  return (
    <footer className="site-footer empire-footer"><div className="container empire-footer-grid"><div className="empire-footer-name"><span>♛</span><strong>{identity.siteName}</strong><p>{identity.tagline}</p></div><div><strong>RUNTIME</strong><p>Formula · Text · AI · API · Webhook · Workflow</p></div><div><strong>WEB EMPIRE</strong><p>webempire.site</p><p>© 2026</p></div></div></footer>
  );
}
