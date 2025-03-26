export default function ApplicationLogo(props) {
    const appName = import.meta.env.VITE_APP_NAME || "Default Name";
    const words = appName.split(" ");
    const firstLine = words.slice(0, 3).join(" ");
    const secondLine = words.slice(3).join(" ");

    return (
        <div className="font-bold text-center">
            <div>{firstLine}</div>
            {secondLine && <div>{secondLine}</div>}
        </div>
    );
}
