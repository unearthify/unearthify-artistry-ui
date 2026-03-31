import { Link, useLocation, useParams } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  const { categorySlug, artTypeSlug } = useParams();

  const isArt = location.pathname.startsWith("/artform");

  const pretty = (text?: string) =>
    text
      ? text.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "";

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ol className="flex items-center gap-1 flex-wrap">

        {/* HOME */}
        {/* <li>
          <Link to="/" className="hover:underline">Home</Link>
        </li> */}

        {isArt && (
          <>
            {/* <li>/</li> */}
            <li>
              <Link to="/art-forms" className="hover:underline">
                Art Forms
              </Link>
            </li>
          </>
        )}

        {/* CATEGORY */}
        {categorySlug && (
          <>
            <li>/</li>
            <li>
              <Link to={`/artform/${categorySlug}`} className="hover:underline">
                {pretty(categorySlug)}
              </Link>
            </li>
          </>
        )}

        {/* ART TYPE */}
        {artTypeSlug && (
          <>
            <li>/</li>
            <li className="font-semibold text-gray-900">
              {pretty(artTypeSlug)}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
