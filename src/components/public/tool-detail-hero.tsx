type ToolDetailHeroCopy = {
  workflowInput: string;
  workflowRun: string;
  workflowResult: string;
};

export function ToolDetailHero({
  engineCode,
  title,
  description,
  accessLabel,
  pricing,
  copy,
}: {
  engineCode: string;
  title: string;
  description: string;
  accessLabel: string;
  pricing: string;
  copy: ToolDetailHeroCopy;
}) {
  return (
    <header className="editorial-tool-hero empire-workbench-hero">
      <div className="container empire-workbench-hero-grid">
        <div className="empire-workbench-head">
          <p className="empire-section-kicker">WORKBENCH</p>
          <p className="empire-workbench-engine" dir="ltr">
            {engineCode.toUpperCase()}
          </p>
          <h1 className="editorial-tool-title empire-workbench-title">{title}</h1>
          <p className="editorial-tool-description empire-workbench-description">{description}</p>
        </div>

        <div className="empire-workbench-side">
          <div className="empire-workbench-access">
            <small>{accessLabel}</small>
            <strong>{pricing}</strong>
          </div>

          <ol className="empire-workbench-flow" aria-label="Workflow">
            <li>
              <span>01</span>
              <b>{copy.workflowInput}</b>
            </li>
            <li>
              <span>02</span>
              <b>{copy.workflowRun}</b>
            </li>
            <li>
              <span>03</span>
              <b>{copy.workflowResult}</b>
            </li>
          </ol>
        </div>
      </div>
    </header>
  );
}
