// Tiny cross-section events: links in the nav, menu and footer can open a specific service tab.
export const SERVICE_EVENT = "zariva:service";

export function selectService(index: number) {
  window.dispatchEvent(new CustomEvent<number>(SERVICE_EVENT, { detail: index }));
}
