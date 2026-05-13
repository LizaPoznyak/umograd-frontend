import { type JSX } from "react";

type ProgressPoint = {
    date: string;
    averageScore: number;
};

type Props = {
    childrenData: Record<string, ProgressPoint[]>;
};

const colors = ["#4A90E2", "#7FCA68", "#FFA500", "#9B59B6"];

export default function AggregateProgressChart({ childrenData }: Props): JSX.Element {
    const entries = Object.entries(childrenData).filter(([_, points]) => points && points.length > 0);

    if (entries.length === 0) {
        return <div style={{ textAlign: "center", color: "#6F7376", padding: "20px", fontFamily: "Nunito" }}>Нет данных для построения общего графика</div>;
    }

    const width = 550;
    const height = 250;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const allDates = Array.from(new Set(entries.flatMap(([_, points]) => points.map(p => p.date)))).sort();
    const pointsCount = allDates.length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", background: "rgba(255, 255, 255, 0.6)", padding: "20px", borderRadius: "20px", fontFamily: "Nunito, sans-serif" }}>
            <svg width={width} height={height}>
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#6F7376" strokeWidth="2" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#6F7376" strokeWidth="2" />

                {[0, 50, 100].map((val) => {
                    const y = padding + chartHeight - (val / 100) * chartHeight;
                    return (
                        <g key={val}>
                            <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="#6F7376" strokeWidth="1" />
                            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6F7376">{val}</text>
                        </g>
                    );
                })}

                {entries.map(([childName, points], childIdx) => {
                    const color = colors[childIdx % colors.length];

                    const svgPoints = points.map((p) => {
                        const dateIdx = allDates.indexOf(p.date);
                        const x = padding + (pointsCount > 1 ? (dateIdx / (pointsCount - 1)) * chartWidth : chartWidth / 2);
                        const y = padding + chartHeight - (p.averageScore / 100) * chartHeight;
                        return `${x},${y}`;
                    }).join(" ");

                    return (
                        <g key={childName}>
                            {points.length > 1 && (
                                <polyline fill="none" stroke={color} strokeWidth="3" points={svgPoints} strokeLinecap="round" strokeLinejoin="round" />
                            )}
                            {points.map((p) => {
                                const dateIdx = allDates.indexOf(p.date);
                                const x = padding + (pointsCount > 1 ? (dateIdx / (pointsCount - 1)) * chartWidth : chartWidth / 2);
                                const y = padding + chartHeight - (p.averageScore / 100) * chartHeight;
                                return (
                                    <circle key={p.date} cx={x} cy={y} r="4" fill={color} />
                                );
                            })}
                        </g>
                    );
                })}

                {allDates.map((date, idx) => {
                    const showLabel = idx === 0 || idx === allDates.length - 1 || (allDates.length > 5 && idx === Math.floor(allDates.length / 2));
                    if (!showLabel) return null;
                    const x = padding + (pointsCount > 1 ? (idx / (pointsCount - 1)) * chartWidth : chartWidth / 2);
                    return (
                        <g key={date}>
                            <line x1={x} y1={height - padding} x2={x} y2={height - padding + 5} stroke="#6F7376" strokeWidth="1" />
                            <text x={x} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#6F7376">{date}</text>
                        </g>
                    );
                })}
            </svg>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
                {entries.map(([childName, _], childIdx) => (
                    <div key={childName} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", fontWeight: 700, color: "#6F7376" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: colors[childIdx % colors.length] }} />
                        {childName}
                    </div>
                ))}
            </div>
        </div>
    );
}
