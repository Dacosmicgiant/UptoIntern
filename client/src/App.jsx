import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResumeEditor from './components/ResumeEditor/ResumeEditor';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Main Resume Editor Route */}
          <Route path="/resume-editor" element={<ResumeEditor />} />
          
          {/* Default redirect to resume editor */}
          <Route path="/" element={<Navigate to="/resume-editor" replace />} />
          
          {/* Catch all route - redirect to resume editor */}
          <Route path="*" element={<Navigate to="/resume-editor" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;