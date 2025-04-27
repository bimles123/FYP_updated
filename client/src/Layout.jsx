import { Link, Outlet } from "react-router-dom";
import Header from "./Header.jsx";

export default function Layout({ searchValue, setSearchValue }) {
  return (
    <div className="p-4">
      <Header searchValue={searchValue} setSearchValue={setSearchValue} />
      <Outlet />
    </div>
  );
}
