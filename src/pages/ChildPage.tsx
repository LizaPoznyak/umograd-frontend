import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import "../styles/ChildPage.css";
import Footer from "../components/Footer.tsx";
import Image from "../assets/tasks-img.png";
import "../styles/TasksPage.css";

export default function ChildPage() {
    return (
        <div className="app-layout">
            <Navbar/>
            <main className="app-main child-main">
                {/* Заголовки */}
                <div className="child-greeting">
                    <h1 className="child-text">Привет, вова,</h1>
                    <h2 className="child-subtitle">Давай выполним ежедневный квест</h2>
                </div>
                <div className="child-container">
                    {/* Поиск */}
                    <div className="search-bar">
                        <span className="search-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M11.7429 10.343C12.7112 9.02169 13.1449 7.38349 12.9572 5.75615C12.7695 4.12881 11.9743 2.63234 10.7307 1.56613C9.48701 0.499923 7.88665 -0.0573946 6.24973 0.00567858C4.61282 0.0687517 3.06008 0.747564 1.90217 1.90631C0.744249 3.06505 0.0665484 4.61828 0.00464653 6.25524C-0.0572553 7.89219 0.501207 9.49216 1.56831 10.735C2.6354 11.9779 4.13244 12.7721 5.75992 12.9586C7.38739 13.1451 9.02528 12.7102 10.3459 11.741H10.3449C10.3742 11.781 10.4069 11.8193 10.4429 11.856L14.2929 15.706C14.4804 15.8936 14.7348 15.9991 15 15.9992C15.2653 15.9993 15.5198 15.894 15.7074 15.7065C15.895 15.519 16.0005 15.2646 16.0006 14.9994C16.0007 14.7341 15.8954 14.4796 15.7079 14.292L11.8579 10.442C11.8222 10.4058 11.7837 10.3734 11.7429 10.343ZM12.0009 6.499C12.0009 7.22127 11.8586 7.93647 11.5822 8.60376C11.3058 9.27105 10.9007 9.87737 10.39 10.3881C9.87926 10.8988 9.27295 11.3039 8.60566 11.5803C7.93837 11.8567 7.22317 11.999 6.5009 11.999C5.77863 11.999 5.06343 11.8567 4.39614 11.5803C3.72885 11.3039 3.12253 10.8988 2.61181 10.3881C2.10109 9.87737 1.69596 9.27105 1.41956 8.60376C1.14316 7.93647 1.0009 7.22127 1.0009 6.499C1.0009 5.04031 1.58036 3.64136 2.61181 2.60991C3.64326 1.57846 5.04221 0.999002 6.5009 0.999002C7.95959 0.999002 9.35853 1.57846 10.39 2.60991C11.4214 3.64136 12.0009 5.04031 12.0009 6.499Z"
                                fill="#98A0A4"/>
                            </svg>
                        </span>
                        <input type="text" placeholder="Поиск..."/>
                    </div>

                    {/* Список заданий */}
                    <div className="tasks-list">
                        <div className="tasks-item">
                            <img src={Image} alt="Картинка задания" className="tasks-img"/>
                            <div className="tasks-info-btn">
                                <div className="tasks-info">
                                    <p className="tasks-title">Алгебра</p>
                                    <div className="tasks-description-diff">
                                        <p className="tasks-description">
                                            Квиз
                                        </p>
                                        <p className="tasks-diff">
                                            🔥🔥
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="tasks-btn"
                                >
                                    Начать
                                </button>
                            </div>
                        </div>
                        <div className="tasks-item">
                            <img src={Image} alt="Картинка задания" className="tasks-img"/>
                            <div className="tasks-info-btn">
                                <div className="tasks-info">
                                    <p className="tasks-title">Животные</p>
                                    <div className="tasks-description-diff">
                                        <p className="tasks-description">
                                            Квиз
                                        </p>
                                        <p className="tasks-diff">
                                            🔥
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="tasks-btn"
                                >
                                    Начать
                                </button>
                            </div>
                        </div>
                        <div className="tasks-item">
                            <img src={Image} alt="Картинка задания" className="tasks-img"/>
                            <div className="tasks-info-btn">
                                <div className="tasks-info">
                                    <p className="tasks-title">Человек</p>
                                    <div className="tasks-description-diff">
                                        <p className="tasks-description">
                                            Карты
                                        </p>
                                        <p className="tasks-diff">
                                            🔥🔥🔥
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="tasks-btn"
                                >
                                    Начать
                                </button>
                            </div>
                        </div>
                        <div className="tasks-item">
                            <img src={Image} alt="Картинка задания" className="tasks-img"/>
                            <div className="tasks-info-btn">
                                <div className="tasks-info">
                                    <p className="tasks-title">Геометрия</p>
                                    <div className="tasks-description-diff">
                                        <p className="tasks-description">
                                            Задачи
                                        </p>
                                        <p className="tasks-diff">
                                            🔥
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="tasks-btn"
                                >
                                    Начать
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
