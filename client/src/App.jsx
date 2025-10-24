import { ToastContainer } from "react-toastify";

import LandfillMap from './components/LandfillMap';

import "react-toastify/dist/ReactToastify.css";

function App() {
  return <>
    <LandfillMap />
    <ToastContainer position="bottom-right" />
  </>
}

export default App;
