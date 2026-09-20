import Header from './Header';
import Dashboard from './Dashboard';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Header />
        <Dashboard />
      </>
    ),
  },
]); 