import { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from '@/components/ui/sonner';
import { BoardPage } from '@/pages/BoardPage';
import { BoardsPage } from '@/pages/BoardsPage';

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('taskflow-theme') === 'dark');

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('taskflow-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const boardId = useMemo(() => {
    const match = path.match(/^\/boards\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }, [path]);

  function navigate(to: string) {
    window.history.pushState(null, '', to);
    setPath(to);
  }

  const page = boardId ? <BoardPage boardId={boardId} navigate={navigate} /> : <BoardsPage navigate={navigate} />;

  return (
    <>
      <AppHeader
        isDarkMode={isDarkMode}
        path={path}
        navigate={navigate}
        onToggleTheme={() => setIsDarkMode((current) => !current)}
      />
      {page}
      <Toaster />
    </>
  );
}

export default App;
