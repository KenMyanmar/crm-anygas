
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <div className="max-w-md px-4 text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-2 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-4 text-muted-foreground">
          We couldn't find the page you're looking for: {location.pathname}
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
