import { Link, useLocation } from "@/lib/router-compat";
import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<ComponentProps<typeof Link>, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

// The router-compat NavLink is a plain Link (no function-form className),
// so active state is derived from useLocation instead.
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName: _pendingClassName, to, ...props }, ref) => {
    const { pathname } = useLocation();
    const target = (to ?? "").split(/[?#]/)[0] || "/";
    const isActive = pathname === target || (target !== "/" && pathname.startsWith(`${target}/`));
    return <Link ref={ref} to={to} className={cn(className, isActive && activeClassName)} {...props} />;
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
