import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  ShieldAlert,
  Trophy,
  BookOpen,
  Pencil,
  BookIcon,
} from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location]);

  const renderUserDropdown = () => {
    if (!user) return null;
    return (
      <DropdownMenu>
        <DropdownMenuContent
          align="end"
          className="bg-cyber-darkgray border border-cyber-blue/30 text-white"
        >
          {isAdmin && (
            <>
              <DropdownMenuItem
                className="hover:bg-cyber-green/10 hover:text-cyber-green cursor-pointer"
                onClick={() => (window.location.href = "/admin")}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Admin Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cyber-green/20" />
            </>
          )}
          
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav
      className={cn(
        "w-full py-3 px-4 md:px-6 fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cyber-black/95 backdrop-blur-sm shadow-lg shadow-cyber-blue/10"
          : "bg-cyber-black/80"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-cyber-pink transition-colors">
          <span className="hidden sm:inline text-cyber-pink">DarkWave</span>
          <span>CTF</span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={cn("px-4 py-2 rounded-md", isActive("/") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>Home</Link>
          <Link to="/challenges" className={cn("px-4 py-2 rounded-md", isActive("/challenges") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>Challenges</Link>
          <Link to="/resources" className={cn("px-4 py-2 rounded-md", isActive("/resources") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>Resources</Link>
          <Link to="/scoreboard" className={cn("px-4 py-2 rounded-md", isActive("/scoreboard") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>Scoreboard</Link>
          <Link to="/about" className={cn("px-4 py-2 rounded-md", isActive("/about") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>About</Link>
          {isAdmin && (
            <Link to="/admin" className={cn("px-4 py-2 rounded-md", isActive("/admin") ? "text-cyber-green bg-cyber-green/10" : "text-gray-300 hover:bg-cyber-green/10 hover:text-cyber-green")}>
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center">
              {!isMobile && renderUserDropdown()}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-cyber-blue hover:bg-cyber-blue/10 hover:text-cyber-blue">
                    Profile <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-cyber-darkgray border border-cyber-blue/30 text-white">
                  <DropdownMenuLabel className="text-gray-400">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-cyber-blue/20" />
                  <DropdownMenuItem
                    className="hover:bg-cyber-blue/10 hover:text-cyber-blue cursor-pointer"
                    onClick={() => (window.location.href = "/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  {isMobile && (
                    <>
                      {isAdmin && (
                        <DropdownMenuItem
                          className="hover:bg-cyber-green/10 hover:text-cyber-green cursor-pointer"
                          onClick={() => (window.location.href = "/admin")}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                    
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-cyber-blue/20" />
                  <DropdownMenuItem className="hover:bg-red-500/10 hover:text-red-500 cursor-pointer" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant="outline" className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10" onClick={() => (window.location.href = "/auth")}>
              Sign In
            </Button>
          )}

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-cyber-black/95 backdrop-blur-sm border-t border-cyber-blue/20 shadow-xl shadow-cyber-blue/5">
          <div className="flex flex-col p-4 space-y-1">
            <Link to="/" className={cn("px-4 py-3 rounded-md", isActive("/") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>Home</Link>
            <Link to="/challenges" className={cn("px-4 py-3 rounded-md", isActive("/challenges") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>Challenges</Link>
            <Link to="/resources" className={cn("px-4 py-3 rounded-md flex items-center", isActive("/resources") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>
              <BookIcon className="mr-2 h-4 w-4" /> Resources
            </Link>
            <Link to="/scoreboard" className={cn("px-4 py-3 rounded-md flex items-center", isActive("/scoreboard") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>
              <Trophy className="mr-2 h-4 w-4" /> Scoreboard
            </Link>
            <Link to="/about" className={cn("px-4 py-3 rounded-md flex items-center", isActive("/about") ? "text-cyber-blue bg-cyber-blue/10" : "text-gray-300 hover:bg-cyber-blue/10 hover:text-cyber-blue")}>
              <BookOpen className="mr-2 h-4 w-4" /> About
            </Link>
            {isAdmin && (
              <Link to="/admin" className={cn("px-4 py-3 rounded-md flex items-center", isActive("/admin") ? "text-cyber-green bg-cyber-green/10" : "text-gray-300 hover:bg-cyber-green/10 hover:text-cyber-green")}>
                <ShieldAlert className="mr-2 h-4 w-4" /> Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
