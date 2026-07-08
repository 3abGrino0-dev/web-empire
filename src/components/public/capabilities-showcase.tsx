type CapabilityItem = {
  title: string;
  description: string;
  motif: "calculate" | "create" | "transform" | "analyze" | "automate" | "connect";
};

function visualForMotif(motif: CapabilityItem["motif"]) {
  if (motif === "calculate") {
    return (
      <div className="capability-motif motif-calculate" aria-hidden="true">
        <span>40</span>
        <b>+</b>
        <span>60</span>
        <strong>= 100</strong>
      </div>
    );
  }

  if (motif === "create") {
    return (
      <div className="capability-motif motif-create" aria-hidden="true">
        <p>| draft headline</p>
        <p>| expand paragraph</p>
        <p>| publish version</p>
      </div>
    );
  }

  if (motif === "transform") {
    return (
      <div className="capability-motif motif-transform" aria-hidden="true">
        <span>A</span>
        <b>→</b>
        <span>B</span>
      </div>
    );
  }

  if (motif === "analyze") {
    return (
      <div className="capability-motif motif-analyze" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }

  if (motif === "automate") {
    return (
      <div className="capability-motif motif-automate" aria-hidden="true">
        <span>01</span>
        <b>→</b>
        <span>02</span>
        <b>→</b>
        <span>03</span>
      </div>
    );
  }

  return (
    <div className="capability-motif motif-connect" aria-hidden="true">
      <span>endpoint A</span>
      <b />
      <span>endpoint B</span>
    </div>
  );
}

export function CapabilitiesShowcase({
  copy,
}: {
  copy: {
    capabilityKicker: string;
    capabilityTitle: string;
    capabilityBody: string;
    capabilities: readonly CapabilityItem[];
  };
}) {
  return (
    <section className="empire-section empire-capability-section">
      <div className="container">
        <div className="empire-capability-intro">
          <div className="empire-capability-intro-main">
            <p className="empire-section-kicker">{copy.capabilityKicker}</p>
            <h2 className="empire-capability-title">{copy.capabilityTitle}</h2>
          </div>
          <p className="empire-capability-body">{copy.capabilityBody}</p>
        </div>

        <div className="empire-capability-rows" aria-label="Capabilities manifesto">
          {copy.capabilities.map((item, index) => {
            const number = String(index + 1).padStart(2, "0");

            return (
              <article className={`empire-capability-row capability-row-${index + 1}`} key={number}>
                <span className="empire-capability-number">{number}</span>

                <div className="empire-capability-copy">
                  <small>CAPABILITY {number}</small>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="empire-capability-visual">{visualForMotif(item.motif)}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}