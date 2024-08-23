'use client'
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertTitle, Tab, Tabs, Box, TextField, Button, Typography, Select, MenuItem, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import BookIcon from '@mui/icons-material/Book';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';

const colorPalette = {
  primary: '#4F46E5',
  secondary: '#10B981',
  accent: '#F59E0B',
  background: '#FFFFFF',
  text: '#1F2937',
};

const mockSentimentData = [
  { date: '2023-08', sentiment: 0.7 },
  { date: '2023-09', sentiment: 0.8 },
  { date: '2023-10', sentiment: 0.6 },
  { date: '2023-11', sentiment: 0.9 },
  { date: '2023-12', sentiment: 0.75 },
];

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `👋 Hi! I'm the Rate My Professor AI assistant. How can I help you today?` },
  ]);
  const [message, setMessage] = useState('');
  const [professor, setProfessor] = useState('');
  const [timeRange, setTimeRange] = useState('1month');
  const [sentimentData, setSentimentData] = useState([]);
  const [rmpLink, setRmpLink] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (professor) {
      setSentimentData(mockSentimentData);
    }
  }, [professor, timeRange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedMessages = prevMessages.slice(0, -1);
          return [...updatedMessages, { ...lastMessage, content: lastMessage.content + chunk }];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRmpLink = async () => {
    if (!rmpLink.trim()) return;

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: rmpLink }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape and insert data');
      }

      const result = await response.json();
      alert(`Successfully scraped and inserted data for: ${result.professorName}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to scrape and insert data. Please try again.');
    }

    setRmpLink('');
  };

  const searchProfessors = async () => {
    if (!searchCriteria.trim()) return;

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ criteria: searchCriteria }),
      });

      if (!response.ok) {
        throw new Error('Failed to search professors');
      }

      const result = await response.json();
      setRecommendations(result.professors);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to search professors. Please try again.');
    }
  };

  const fetchSentimentData = async () => {
    if (!professor.trim()) return;

    try {
      const response = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ professor, timeRange }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sentiment data');
      }

      const result = await response.json();
      setSentimentData(result.sentimentData);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch sentiment data. Please try again.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Box className="max-w-7xl mx-auto">
        <Box className="text-center mb-8">
          <Typography variant="h2" className="text-4xl font-bold text-indigo-600 mb-2">📚 AI Rate My Professor</Typography>
          <Typography variant="h5" className="text-xl text-gray-600">Your comprehensive AI-powered professor insights platform</Typography>
        </Box>

        <Alert severity="info" className="mb-8">
          <AlertTitle>Welcome to AI Rate My Professor!</AlertTitle>
          Chat with our AI, submit professor links, get personalized recommendations, and analyze sentiment trends.
        </Alert>

        <Tabs value={activeTab} onChange={handleTabChange} className="w-full">
          <Tab label="Chat Assistant" value="chat" icon={<BookIcon />} />
          <Tab label="Submit RMP Link" value="submit" icon={<LinkIcon />} />
          <Tab label="Advanced Search" value="search" icon={<SearchIcon />} />
          <Tab label="Sentiment Analysis" value="sentiment" icon={<TrendingUpIcon />} />
        </Tabs>

        <Paper elevation={3} className="p-6 mt-4">
          {activeTab === 'chat' && (
            <Box>
              <Typography variant="h4" className="mb-4 flex items-center">
                <BookIcon className="mr-2" /> Chat with AI Assistant
              </Typography>
              <Box className="h-96 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, index) => (
                  <Paper
                    key={index}
                    className={`p-3 ${
                      msg.role === 'assistant' ? 'bg-indigo-100' : 'bg-emerald-100 ml-auto'
                    } max-w-[80%]`}
                  >
                    <Typography>{msg.content}</Typography>
                  </Paper>
                ))}
                <div ref={messagesEndRef} />
              </Box>
              <Box className="flex">
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about a professor..."
                  variant="outlined"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  disabled={isLoading}
                >
                  Send
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 'submit' && (
            <Box>
              <Typography variant="h4" className="mb-4 flex items-center">
                <LinkIcon className="mr-2" /> Submit RMP Link
              </Typography>
              <Box className="flex mb-4">
                <TextField
                  fullWidth
                  value={rmpLink}
                  onChange={(e) => setRmpLink(e.target.value)}
                  placeholder="Enter Rate My Professor link..."
                  variant="outlined"
                />
                <Button
                  onClick={submitRmpLink}
                  variant="contained"
                  color="primary"
                  endIcon={<LinkIcon />}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 'search' && (
            <Box>
              <Typography variant="h4" className="mb-4 flex items-center">
                <SearchIcon className="mr-2" /> Advanced Search
              </Typography>
              <Box className="flex mb-4">
                <TextField
                  fullWidth
                  value={searchCriteria}
                  onChange={(e) => setSearchCriteria(e.target.value)}
                  placeholder="Enter search criteria (e.g., 'Computer Science, 4+ rating')..."
                  variant="outlined"
                />
                <Button
                  onClick={searchProfessors}
                  variant="contained"
                  color="primary"
                  endIcon={<SearchIcon />}
                >
                  Search
                </Button>
              </Box>
              <Box className="space-y-2">
                {recommendations.map((prof, index) => (
                  <Paper key={index} className="p-3">
                    <Typography variant="h6">{prof.name}</Typography>
                    <Typography>Rating: {prof.rating}</Typography>
                    <Typography>Department: {prof.department}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {activeTab === 'sentiment' && (
            <Box>
              <Typography variant="h4" className="mb-4 flex items-center">
                <TrendingUpIcon className="mr-2" /> Sentiment Analysis
              </Typography>
              <Box className="mb-4 space-y-4">
                <TextField
                  fullWidth
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  placeholder="Enter professor name"
                  variant="outlined"
                />
                <Select
                  fullWidth
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="1month">1 Month</MenuItem>
                  <MenuItem value="3months">3 Months</MenuItem>
                  <MenuItem value="6months">6 Months</MenuItem>
                  <MenuItem value="1year">1 Year</MenuItem>
                </Select>
                <Button
                  onClick={fetchSentimentData}
                  variant="contained"
                  color="primary"
                  endIcon={<TrendingUpIcon />}
                >
                  Analyze Sentiment
                </Button>
              </Box>
              {sentimentData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sentimentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sentiment" stroke={colorPalette.accent} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}