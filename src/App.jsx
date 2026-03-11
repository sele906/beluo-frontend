import Router from "./routes/Router";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./hook/AuthContext";
import "./styles/reset.css";
import './styles/globals.css'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={Router}/>
    </AuthProvider>
  );
}

export default App;