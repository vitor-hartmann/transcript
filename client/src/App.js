import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MinutesDocument from './components/MinutesDocument';
import MinutesPreview from './components/MinutesPreview';
import AdminConfig from './components/AdminConfig';
import './App.css';
import './index.css';
import { ConfigProvider } from './context/ConfigContext';

function App() {
  const [inputText, setInputText] = useState('');
  const [processedMinutes, setProcessedMinutes] = useState(null);
  const [loading, setLoading] = useState(false);

  const processMinutes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/process-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setProcessedMinutes(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <ConfigProvider>
      <Router>
        <div className="app">
          <header>
            <h1>SexyMinutes</h1>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/admin">Admin</Link>
            </nav>
          </header>

          <Routes>
            <Route path="/admin" element={<AdminConfig />} />
            <Route path="/" element={
              <main>
                <div className="input-section">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your meeting transcript here..."
                  />
                  <button onClick={processMinutes} disabled={loading}>
                    {loading ? 'Processing...' : 'Generate Minutes'}
                  </button>
                </div>

                {processedMinutes && (
                  <div className="preview-section">
                    <MinutesPreview data={processedMinutes} />
                    <PDFDownloadLink
                      document={<MinutesDocument data={processedMinutes} />}
                      fileName="meeting-minutes.pdf"
                    >
                      {({ loading }) => 
                        loading ? 'Preparing PDF...' : 'Download PDF'
                      }
                    </PDFDownloadLink>
                  </div>
                )}
              </main>
            } />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App; 