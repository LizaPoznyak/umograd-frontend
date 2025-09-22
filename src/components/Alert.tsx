type AlertProps = {
    type: "success" | "error" | "info";
    message: string | null;
};

export default function Alert({ type, message }: AlertProps) {
    if (!message) return null;

    let color = "#333333";
    if (type === "success") color = "#5ADBA0";
    if (type === "error") color = "#D7372E";
    if (type === "info") color = "#59C9D2";

    return (
        <div
            style={{
                border: `1px solid ${color}`,
                padding: "0.5rem 1rem",
                marginBottom: "1rem",
                borderRadius: "4px",
                color,
                fontWeight: 500,
            }}
        >
            {message}
        </div>
    );
}
