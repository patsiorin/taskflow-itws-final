import { useEffect, useMemo, useState } from 'react';
import { BoardPage } from '@/pages/BoardPage';
import { BoardsPage } from '@/pages/BoardsPage';

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const boardId = useMemo(() => {
    const match = path.match(/^\/boards\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }, [path]);

  function navigate(to: string) {
    window.history.pushState(null, '', to);
    setPath(to);
  }

  if (boardId) {
    return <BoardPage boardId={boardId} navigate={navigate} />;
  }

  return <BoardsPage navigate={navigate} />;
}

export default App;
