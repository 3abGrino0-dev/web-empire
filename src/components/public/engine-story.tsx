type EngineStoryItem = {
  key: string;
  code: string;
  title: string;
  description: string;
};

function toRuntimeClass(engineKey: string): string {
  return `runtime-${engineKey.replace(/_/g, "-")}`;
}

function EngineVisual({ engineKey }: { engineKey: string }) {
  switch (engineKey) {
    case "formula":
      return (
        <div className="empire-runtime-visual-formula" dir="ltr" aria-hidden="true">
          <span>25</span>
          <b>/</b>
          <span>200</span>
          <b>=</b>
          <strong>12.5</strong>
        </div>
      );
    case "text_transform":
      return (
        <div className="empire-runtime-visual-transform" dir="ltr" aria-hidden="true">
          <div>
            <small>BEFORE</small>
            <p>raw text raw text raw text</p>
          </div>
          <span>{"->"}</span>
          <div>
            <small>AFTER</small>
            <p>CLEAN TEXT CLEAN TEXT CLEAN TEXT</p>
          </div>
        </div>
      );
    case "ai_text":
      return (
        <div className="empire-runtime-visual-ai-text" dir="ltr" aria-hidden="true">
          <small>PROMPT</small>
          <p>Write a clear result...</p>
          <p>Line one generated output.</p>
          <p>Line two generated output.</p>
          <p>Line three generated output.</p>
        </div>
      );
    case "ai_structured":
      return (
        <div className="empire-runtime-visual-ai-structured" dir="ltr" aria-hidden="true">
          <span>{"{"}</span>
          <p>
            <b>field:</b> value
          </p>
          <p>
            <b>type:</b> string
          </p>
          <p>
            <b>status:</b> ok
          </p>
          <span>{"}"}</span>
        </div>
      );
    case "http_api":
      return (
        <div className="empire-runtime-visual-http" dir="ltr" aria-hidden="true">
          <p>POST /endpoint</p>
          <span>{"->"}</span>
          <strong>200</strong>
        </div>
      );
    case "webhook":
      return (
        <div className="empire-runtime-visual-webhook" dir="ltr" aria-hidden="true">
          <small>EVENT</small>
          <b />
          <small>DESTINATION</small>
        </div>
      );
    case "workflow":
      return (
        <div className="empire-runtime-visual-workflow" dir="ltr" aria-hidden="true">
          <span>01</span>
          <b>{"->"}</b>
          <span>02</span>
          <b>{"->"}</b>
          <span>03</span>
        </div>
      );
    default:
      return (
        <div className="empire-runtime-visual-generic" dir="ltr" aria-hidden="true">
          <span>INPUT</span>
          <b>{"->"}</b>
          <span>RUN</span>
          <b>{"->"}</b>
          <span>RESULT</span>
        </div>
      );
  }
}

export function EngineStory({
  kicker,
  title,
  body,
  engines,
}: {
  kicker: string;
  title: string;
  body: string;
  engines: readonly EngineStoryItem[];
}) {
  const rail = engines.map((engine) => engine.code).join(" | ");

  return (
    <section className="empire-section empire-runtime-story" aria-labelledby="empire-runtime-title">
      <div className="container empire-runtime-shell">
        <header className="empire-runtime-intro">
          <p className="empire-section-kicker">{kicker}</p>
          <h2 id="empire-runtime-title" className="empire-runtime-title">
            {title}
          </h2>
          <p className="empire-runtime-body">{body}</p>
          <p className="empire-runtime-flow" dir="ltr">
            <span>INPUT</span>
            <b>{"->"}</b>
            <span>RUN</span>
            <b>{"->"}</b>
            <span>RESULT</span>
          </p>
        </header>

        <p className="empire-runtime-rail" dir="ltr" aria-label={rail}>
          <span>{rail}</span>
          <span aria-hidden="true">{rail}</span>
        </p>

        <div className="empire-runtime-list" role="list">
          {engines.map((engine, index) => (
            <article
              key={engine.key}
              role="listitem"
              className={`empire-runtime-item ${toRuntimeClass(engine.key)} rhythm-${index % 3}`}
            >
              <p className="empire-runtime-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>

              <div className="empire-runtime-copy">
                <h3>{engine.title}</h3>
                <p>{engine.description}</p>
              </div>

              <p className="empire-runtime-code" dir="ltr">
                {engine.code}
              </p>

              <div className="empire-runtime-visual">
                <EngineVisual engineKey={engine.key} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
