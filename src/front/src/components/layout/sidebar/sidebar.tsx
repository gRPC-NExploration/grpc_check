import { Link } from '@tanstack/react-router';
import { LogIn, LucideIcon, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';

import LoginForm from '@/components/features/auth/login-form.tsx';
import LogoutForm from '@/components/features/auth/logout-form.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useTheme } from '@/lib/providers/theme-provider.tsx';
import { FileRouteTypes } from '@/routeTree.gen.ts';

export type ISidebarLink = {
    to: FileRouteTypes['to'];
    icon: LucideIcon;
    tooltip: string;
};

interface SidebarLinksProps {
    links: ISidebarLink[];
}

type SidebarProps = SidebarLinksProps;

const SidebarLinks = ({ links }: SidebarLinksProps) => {
    return (
        <div className="flex flex-col gap-2">
            {links.map(link => (
                <Button
                    key={link.to}
                    variant="outline"
                    className="size-12"
                    asChild
                >
                    <Link
                        to={link.to}
                        className="[&.active]:bg-sidebar-primary [&.active]:hover:bg-sidebar-primary [&.active]:[&_svg]:text-sidebar-primary-foreground"
                    >
                        <link.icon className="size-5" />
                    </Link>
                </Button>
            ))}
        </div>
    );
};

const SidebarUser = () => {
    const { setTheme } = useTheme();

    const { token, userName } = useAuth();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
    const [isLogoutFormOpen, setIsLogoutFormOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsDropdownOpen(open);
    };

    const handleLoginClick = () => {
        setIsLoginFormOpen(true);
        setIsDropdownOpen(false);
    };

    const handleLogoutClick = () => {
        setIsLogoutFormOpen(true);
        setIsDropdownOpen(false);
    };

    return (
        <div className="flex flex-col gap-2">
            <DropdownMenu open={isDropdownOpen} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="size-12">
                        {token && userName ? (
                            <User className="size-5" />
                        ) : (
                            <LogIn className="size-5" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top">
                    {token && userName && (
                        <>
                            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuLabel className="flex justify-between gap-2">
                        {token && userName ? (
                            <Button
                                variant="outline"
                                onClick={handleLogoutClick}
                            >
                                Выйти
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleLoginClick}
                            >
                                Войти
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                side="top"
                                className="top-0"
                            >
                                <DropdownMenuItem
                                    onClick={() => setTheme('light')}
                                >
                                    Светлая
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTheme('dark')}
                                >
                                    Тёмная
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTheme('system')}
                                >
                                    Системная
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>

            <LoginForm
                isOpen={isLoginFormOpen}
                onClose={() => setIsLoginFormOpen(false)}
            />
            <LogoutForm
                isOpen={isLogoutFormOpen}
                onClose={() => setIsLogoutFormOpen(false)}
            />
        </div>
    );
};

const Sidebar = ({ links }: SidebarProps) => {
    return (
        <aside className="bg-sidebar flex h-full flex-col items-center justify-between rounded-lg border-1 p-2">
            <SidebarLinks links={links} />
            <SidebarUser />
        </aside>
    );
};

export default Sidebar;
