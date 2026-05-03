import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((m) => addToast(m, 'success'), [addToast]);
  const error = useCallback((m) => addToast(m, 'error'), [addToast]);
  const info = useCallback((m) => addToast(m, 'info'), [addToast]);
  const warning = useCallback((m) => addToast(m, 'warning'), [addToast]);

  return (
    <NotificationContext.Provider value={{ toasts, success, error, info, warning, removeToast }}>
      {children}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type} pointer-events-auto`}
            onClick={() => removeToast(t.id)}
          >
            {t.message}
            <button className="ml-2 opacity-70 hover:opacity-100">&times;</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
