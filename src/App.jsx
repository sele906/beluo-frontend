import Router from "./routes/Router";
import { RouterProvider } from "react-router-dom";
import "./styles/reset.css";
import './styles/globals.css'

function App() {
  return (
    <div>
      <RouterProvider router={Router}/>
    </div>
  );
}

export default App;