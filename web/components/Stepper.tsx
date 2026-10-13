/** Where the user is in a flow: one bar per step. Done steps are black, the current one is green. */
export function Stepper({ titles, current }: { titles: string[]; current: number }) {
  const done = current >= titles.length;
  return (
    <nav aria-label="Progress">
      <ol className="flex gap-1.5">
        {titles.map((title, i) => (
          <li
            key={title}
            aria-current={i === current ? "step" : undefined}
            className={`h-1 flex-1 rounded-full transition-[background-color] duration-250 ease-out ${
              i < current ? "bg-black" : i === current ? "bg-green" : "bg-grey-line"
            }`}
          >
            <span className="sr-only">
              {title}
              {i < current ? ", done" : i === current ? ", current step" : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="sr-only">{done ? "Done" : `Step ${current + 1} of ${titles.length}`}</p>
    </nav>
  );
}
