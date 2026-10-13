/** Stands in for a figure that is not known: a short rule drawn at the size of the text around it. */
export function Blank() {
  return <span role="img" aria-label="Unavailable" className="inline-block h-[0.08em] w-[0.6em] rounded-full bg-current align-middle" />;
}
