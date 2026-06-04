import { Moon, PanelsTopLeft, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem } from '@/components/ui/navigation-menu';
import { Tooltip } from '@/components/ui/tooltip';

type AppHeaderProps = {
  isDarkMode: boolean;
  path: string;
  navigate: (to: string) => void;
  onToggleTheme: () => void;
};

export function AppHeader({ isDarkMode, path, navigate, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button className="flex items-center gap-2 font-semibold" onClick={() => navigate('/')} type="button">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <PanelsTopLeft className="h-5 w-5" />
          </span>
          <span>TaskFlow</span>
        </button>

        <div className="flex items-center gap-2">
          <NavigationMenu className="hidden sm:flex">
            <NavigationMenuItem isActive={path === '/'} onClick={() => navigate('/')}>
              Boards
            </NavigationMenuItem>
          </NavigationMenu>
          <Tooltip content={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Button size="icon" variant="outline" onClick={onToggleTheme}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

