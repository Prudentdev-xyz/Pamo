/** Where the user is in a flow: "Step 2 of 4" plus the step names. */
export function Stepper({ titles, current }: { titles: string[]; current: number }) {
  const done = current >= titles.length;
  return (
    <nav aria-label="Progress">
      <p className="text-sm">{done ? "Done" : `Step ${current + 1} of ${titles.length}`}</p>
      <ol className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {titles.map((title, i) => (
          <li key={title} aria-current={i === current ? "step" : undefined} className={i === current ? "font-bold underline" : i < current ? "" : "opacity-50"}>
            {i < current ? "✓ " : ""}
            {title}
          </li>
        ))}
      </ol>
    </nav>
  );
}
