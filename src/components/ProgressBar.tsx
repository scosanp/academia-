type ProgressBarProps = {
  value: number;
  label: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  const normalized = Math.min(100, Math.max(0, value));

  return (
    <div className="progress">
      <div className="progress__meta">
        <span>{label}</span>
        <strong>{normalized}%</strong>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
      >
        <span className="progress__fill" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}
