'use client'
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Dynamically import PDF viewer components
const PDFViewer = dynamic(() => import('@react-pdf-viewer/core').then(mod => mod.Viewer), {
  ssr: false,
});

// Dynamically import the styles
const PDFViewerStyles = dynamic(() => import('@react-pdf-viewer/core/lib/styles/index.css'), {
  ssr: false,
});

export default function Home() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setPdfUrl(URL.createObjectURL(selectedFile));
      setUploadStatus('PDF selected. Ready to process.');
    } else {
      setFile(null);
      setPdfUrl(null);
      setUploadStatus('Please select a valid PDF file.');
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setUploadStatus('Processing PDF...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setProcessResult(result);
      setUploadStatus('PDF processed successfully. Ready to send to Google Sheets.');
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const requestGoogleAuth = async () => {
    try {
      const response = await fetch('/api/google-auth');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('Error requesting Google authorization.');
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <PDFViewerStyles />
      <Box className="max-w-7xl mx-auto">
        <Box className="text-center mb-8">
          <Typography variant="h2" className="text-4xl font-bold text-indigo-600 mb-2">📄 PDF to Google Sheets</Typography>
          <Typography variant="h5" className="text-xl text-gray-600">Upload your PDF and send it to Google Sheets</Typography>
        </Box>

        <Paper elevation={3} className="p-6 mt-4">
          <Box className="mb-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => fileInputRef.current.click()}
              startIcon={<CloudUploadIcon />}
            >
              Select PDF
            </Button>
          </Box>

          {file && (
            <Box className="mb-4">
              <Typography>{file.name}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={processFile}
                disabled={isProcessing}
                startIcon={<CloudUploadIcon />}
              >
                {isProcessing ? 'Processing...' : 'Process PDF'}
              </Button>
            </Box>
          )}

          {pdfUrl && (
            <Box className="mb-4" style={{ height: '500px' }}>
              <PDFViewer fileUrl={pdfUrl} />
            </Box>
          )}

          {processResult && (
            <Box className="mb-4">
              <Button
                variant="contained"
                color="secondary"
                onClick={requestGoogleAuth}
              >
                Send to Google Sheets
              </Button>
            </Box>
          )}

          {uploadStatus && (
            <Alert severity={uploadStatus.includes('Error') ? 'error' : 'success'}>
              {uploadStatus}
            </Alert>
          )}

          {(isUploading || isProcessing) && <CircularProgress />}
        </Paper>
      </Box>
    </Box>
  );
}