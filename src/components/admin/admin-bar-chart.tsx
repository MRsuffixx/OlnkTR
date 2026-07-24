type ChartDatum = {
  label: string;
  value: number;
};

export function AdminBarChart({
  data,
  title,
  valueLabel,
}: {
  data: ChartDatum[];
  title: string;
  valueLabel: string;
}) {
  const width = 760;
  const height = 220;
  const padding = 28;
  const max = Math.max(1, ...data.map((item) => item.value));
  const barWidth = Math.max(2, (width - padding * 2) / Math.max(1, data.length));
  return (
    <figure>
      <figcaption className="font-black">{title}</figcaption>
      {data.length === 0 ? (
        <p className="text-ink/70 mt-6 text-sm">Bu dönem için veri yok.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${title}: ${data.map((item) => `${item.label} ${item.value}`).join(", ")}`}
            className="mt-4 h-56 w-full overflow-visible"
          >
            <line
              x1={padding}
              x2={width - padding}
              y1={height - padding}
              y2={height - padding}
              className="stroke-ink/20"
            />
            {data.map((item, index) => {
              const barHeight =
                (item.value / max) * (height - padding * 2 - 8);
              return (
                <rect
                  key={`${item.label}-${index}`}
                  x={padding + index * barWidth + 1}
                  y={height - padding - barHeight}
                  width={Math.max(2, barWidth - 3)}
                  height={barHeight}
                  rx={Math.min(4, barWidth / 4)}
                  className="fill-orange"
                >
                  <title>
                    {item.label}: {item.value} {valueLabel}
                  </title>
                </rect>
              );
            })}
          </svg>
          <div className="sr-only">
            <table>
              <caption>{title}</caption>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>{valueLabel}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </figure>
  );
}
