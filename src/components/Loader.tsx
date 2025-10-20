import "./Loader.css";
import paw from "../assets/paw.png"; // твоя картинка лапки

export default function Loader() {
    return (
        <div className="loader-overlay">
            <div className="loader-modal">
                <div className="paws-diagonal">
                    <img src={paw} alt="paw" className="paw paw1" />
                    <img src={paw} alt="paw" className="paw paw2" />
                    <img src={paw} alt="paw" className="paw paw3" />
                    <img src={paw} alt="paw" className="paw paw4" />
                </div>
                <p>Загрузка...</p>
            </div>
        </div>
    );
}
