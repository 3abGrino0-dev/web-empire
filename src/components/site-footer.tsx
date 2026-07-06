import type { SiteIdentity } from "@/localization/types";

export function SiteFooter({ identity }: { identity: SiteIdentity }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <strong>♛ {identity.siteName}</strong>
          <p>{identity.tagline}</p>
        </div>
        <div>
          <strong>Tool Factory</strong>
          <p>Multi AI • Skills • Credits • Localization</p>
        </div>
        <div>
          <strong>© 2026</strong>
          <p>webempire.site</p>
        </div>
      </div>
    </footer>
  );
}
