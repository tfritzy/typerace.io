import { Header } from "../components/Header";
import { LeagueBorderExample } from "../components/LeagueBorderExample";

export const LeagueBordersTestPage = () => {
    return (
        <div className="relative min-h-screen">
            <Header />
            <div className="flex items-center justify-center min-h-screen p-8">
                <div className="content-container">
                    <LeagueBorderExample />
                </div>
            </div>
        </div>
    );
};
