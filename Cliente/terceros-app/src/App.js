import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Table from './Table'; // <-- Importamos tu archivo Table.js

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {/* Usamos el componente real */}
        <Table /> 
      </div>
    </QueryClientProvider>
  );
}

export default App;