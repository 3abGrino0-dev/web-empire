export const PRODUCT_DESIGN_VERSION = 1;
export const PRODUCT_CORE_VERSION = 0;

export function formatProductVersion(activeToolsCount: number) {
  const safeCount = Number.isFinite(activeToolsCount)
    ? Math.max(0, Math.trunc(activeToolsCount))
    : 0;

  return `V${PRODUCT_DESIGN_VERSION}.${PRODUCT_CORE_VERSION}.${safeCount}`;
}
