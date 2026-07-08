type JourneyStep = readonly [string, string, string];

function visualForStep(index: number) {
  if (index === 0) {
    return (
      <div className="empire-journey-motif motif-choose" aria-hidden="true">
        <span>CALCULATE</span>
        <span className="is-selected">CREATE</span>
        <span>ANALYZE</span>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="empire-journey-motif motif-input" aria-hidden="true">
        <span>Text input</span>
        <span>Number</span>
        <span>URL</span>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="empire-journey-motif motif-run" aria-hidden="true">
        <span>INPUT</span>
        <b />
        <span>ENGINE</span>
        <b />
        <span>OUTPUT</span>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="empire-journey-motif motif-review" aria-hidden="true">
        <small>25 / 200</small>
        <strong>12.5</strong>
        <p>RESULT</p>
      </div>
    );
  }

  return (
    <div className="empire-journey-motif motif-finish" aria-hidden="true">
      <span>COPY</span>
      <span>EXPORT</span>
      <span>USE</span>
    </div>
  );
}

export function ToolJourney({
  kicker,
  title,
  steps,
}: {
  kicker: string;
  title: string;
  steps: readonly JourneyStep[];
}) {
  const journeySteps = steps.slice(0, 5);

  return (
    <section id="empire-process" className="empire-section empire-journey">
      <div className="container">
        <div className="empire-journey-intro">
          <div className="empire-journey-intro-main">
            <p className="empire-section-kicker">{kicker}</p>
            <h2 className="empire-journey-title">{title}</h2>
          </div>
          <p className="empire-journey-note">{journeySteps[0]?.[2]}</p>
        </div>

        <div className="empire-journey-track">
          {journeySteps.map((step, index) => {
            const number = step[0] || String(index + 1).padStart(2, "0");
            const heading = step[1];
            const description = step[2];

            return (
              <article className={`empire-journey-step journey-step-${index + 1}`} key={number}>
                <span className="empire-journey-number" aria-hidden="true">{number}</span>

                <div className="empire-journey-copy">
                  <small>STEP {number}</small>
                  <h3>{heading}</h3>
                  <p>{description}</p>
                </div>

                <div className="empire-journey-visual">{visualForStep(index)}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}