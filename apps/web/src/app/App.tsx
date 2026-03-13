import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '../features/home/HomePage';

export const App = (): ReactElement => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};
