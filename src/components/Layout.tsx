import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Layout.css";

export default function Layout() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <Outlet /> {/* сюда будут подставляться страницы */}
            </main>
            <Footer />
        </div>
    );
}
