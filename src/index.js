import ReactDOM from "react-dom";
import App from "./components/home_and_frame/App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./components/annex_pages/About.tsx";
import Tutorial from "./components/annex_pages/Tutorial.tsx";
import Welcome from "./components/annex_pages/Welcome.tsx";

const rootElement = document.getElementById("root");

ReactDOM.render(
  <BrowserRouter basename={"/ui"}>
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/home" exact element={<App />} />
      <Route path="/about" element={<About />} />
      <Route path="/tutorial" element={<Tutorial />} />
    </Routes>
  </BrowserRouter>,
  rootElement
);
