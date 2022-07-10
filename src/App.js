import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import HomePage from './Pages/HomePage';
import EditorPage from './Pages/EditorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/"  element={<HomePage />}/>
        <Route path = "/editor/:room_id"  element={<EditorPage />}/>
      </Routes>
    </Router>
  );
}

export default App;
