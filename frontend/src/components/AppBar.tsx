import { Link } from "react-router-dom";
import { Avatar } from "./BlogCard";
import { jwtDecode } from "jwt-decode";

export const AppBar = () => {
    

    const token = localStorage.getItem("token");
    let name = "U"; // Default Avatar Initial

    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            name = decoded.name ? decoded.name[0].toUpperCase() : "U"; // Use first letter of name
        } catch (error) {
            console.error("Invalid token:", error);
        }
    }

    return (
        <div className="border-b flex justify-between px-10 py-4">
            <Link to={'/blogs'}>
                <div className="flex flex-col justify-center cursor-pointer">
                    BlogApp
                </div>
            </Link>
            <div>
                <Link to={'/publish'}>
                    <button type="button" className="mr-4 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2">
                        Publish
                    </button>
                </Link>
                <Avatar name={name} size="big" />
            </div>
        </div>
    );
};
