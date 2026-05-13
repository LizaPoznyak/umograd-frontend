import { type JSX } from "react";

type ProgressPoint = {
    date: string;
    averageScore: number;
    averageTimeSeconds: number;
    difficulty: string;
};

type Props = {
    data: ProgressPoint[];
};

export default function ProgressChart({ data }: Props): JSX.Element {
    if (!data || data.length === 0) {
        return <div style={{ textAlign: "center", color: "#6F7376", padding: "20px", fontFamily: "Nunito" }}>Нет данных для построения графика</div>;
    }

    const width = 500;
    const height = 200;
    const padding = 40;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxScore = 100;
    const minScore = 0;
    const pointsCount = data.length;

    const svgPoints = data.map((d, index) => {
        const x = padding + (pointsCount > 1 ? (index / (pointsCount - 1)) * chartWidth : chartWidth / 2);
        const y = padding + chartHeight - ((d.averageScore - minScore) / (maxScore - minScore)) * chartHeight;
        return { x, y, score: d.averageScore, date: d.date };
    });

    const polylinePath = svgPoints.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", fontFamily: "Nunito, sans-serif" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255, 255, 255, 0.6)", padding: "20px", borderRadius: "20px" }}>
                <svg width={width} height={height}>
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#6F7376" strokeWidth="2" />
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#6F7376" strokeWidth="2" />

                    {[0, 25, 50, 75, 100].map((val) => {
                        const y = padding + chartHeight - (val / 100) * chartHeight;
                        return (
                            <g key={val}>
                                <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="#6F7376" strokeWidth="1" />
                                <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6F7376">{val}</text>
                            </g>
                        );
                    })}

                    {svgPoints.map((p, idx) => {
                        const showLabel = idx === 0 || idx === svgPoints.length - 1 || (svgPoints.length > 5 && idx === Math.floor(svgPoints.length / 2));
                        if (!showLabel) return null;
                        return (
                            <g key={idx}>
                                <line x1={p.x} y1={height - padding} x2={p.x} y2={height - padding + 5} stroke="#6F7376" strokeWidth="1" />
                                <text x={p.x} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#6F7376">
                                    {p.date}
                                </text>
                            </g>
                        );
                    })}

                    {data.length > 1 && (
                        <polyline fill="none" stroke="#4A90E2" strokeWidth="3" points={polylinePath} strokeLinecap="round" strokeLinejoin="round" />
                    )}

                    {svgPoints.map((p, idx) => (
                        <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#8FDADB" stroke="#4A90E2" strokeWidth="2" />
                            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#2d3748">{Math.round(p.score)}</text>
                        </g>
                    ))}
                </svg>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div style={{ background: "rgba(104, 158, 202, 0.15)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#6F7376" }}>Ср. время решения</div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#4A90E2", marginTop: "5px" }}>
                        {Math.round(data.reduce((acc, p) => acc + p.averageTimeSeconds, 0) / data.length)} сек
                    </div>
                </div>
                <div style={{ background: "rgba(127, 202, 104, 0.15)", padding: "15px", borderRadius: "15px", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#6F7376" }}>Категория / Сложность</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#7FCA68", marginTop: "8px" }}>
                        {Array.from(new Set(data.map(p => p.difficulty))).join(", ")}
                    </div>
                </div>
            </div>
        </div>
    );
}
