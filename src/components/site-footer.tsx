import type { SiteIdentity } from "@/localization/types";

export function SiteFooter({ identity }: { identity: SiteIdentity }) {
  return (
    <footer className="site-footer empire-footer">
      <div className="container footer-grid empire-footer-grid">
        <div>
          <strong>♛ {identity.siteName}</strong>
          <p>{identity.tagline}</p>
        </div>
        <div>
          <strong>ENGINES</strong>
          <p>Formula • Text • AI • API • Workflow</p>
        </div>
        <div>
          <strong>© 2026</strong>
          <p>webempire.site</p>
        </div>
      </div>
    </footer>
  );
}
