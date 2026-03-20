import Router from "./routes/Router";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./hook/AuthContext";
import { Toaster } from "sonner";
import "./styles/reset.css";
import './styles/globals.css'

function App() {
  return (
    <AuthProvider>
      <Toaster theme="dark" position="top-center" richColors />
      <RouterProvider router={Router}/>
    </AuthProvider>
  );
}

export default App;