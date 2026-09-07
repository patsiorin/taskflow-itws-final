import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from '@/components/ui/sonner';
import { BoardPage } from '@/pages/BoardPage';
import { BoardsPage } from '@/pages/BoardsPage';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('taskflow-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('taskflow-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <AppShell isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((current) => !current)} />
    </BrowserRouter>
  );
}

type AppShellProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
};

function AppShell({ isDarkMode, onToggleTheme }: AppShellProps) {
  const location = useLocation();
  const routerNavigate = useNavigate();

  function navigate(to: string) {
    routerNavigate(to);
  }

  return (
    <>
      <AppHeader isDarkMode={isDarkMode} path={location.pathname} navigate={navigate} onToggleTheme={onToggleTheme} />
      <Routes>
        <Route path="/" element={<BoardsPage navigate={navigate} />} />
        <Route path="/boards/:boardId" element={<BoardRoute navigate={navigate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

type BoardRouteProps = {
  navigate: (to: string) => void;
};

function BoardRoute({ navigate }: BoardRouteProps) {
  const { boardId } = useParams();
  const numericBoardId = Number(boardId);

  if (!Number.isInteger(numericBoardId) || numericBoardId <= 0) {
    return <Navigate to="/" replace />;
  }

  return <BoardPage boardId={numericBoardId} navigate={navigate} />;
}

export default App;
