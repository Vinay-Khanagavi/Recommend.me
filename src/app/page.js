import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Send, Book, TrendingUp, Search, Link } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  useEffect(() => {
    if (professor) {
      // In a real app, this would be an API call to fetch sentiment data
      setSentimentData(mockSentimentData);
    }
  }, [professor, timeRange]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setMessage('');

    // Simulating API call to Pinecone for Level 1
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { role: 'assistant', content: `Here's some information about ${message} based on our Pinecone database...` },
      ]);
    }, 1000);
  };

  const submitRmpLink = async () => {
    // Level 2: Web scraping and data insertion logic would go here
    alert(`Scraping and inserting data from: ${rmpLink}`);
    setRmpLink('');
  };

  const searchProfessors = async () => {
    // Level 3: Advanced search and recommendation logic would go here
    setRecommendations([
      { name: 'Dr. Smith', rating: 4.5, department: 'Computer Science' },
      { name: 'Prof. Johnson', rating: 4.2, department: 'Mathematics' },
      { name: 'Dr. Williams', rating: 4.8, department: 'Physics' },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">📚 AI Rate My Professor</h1>
          <p className="text-xl text-gray-600">Your comprehensive AI-powered professor insights platform</p>
        </div>

        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Welcome to AI Rate My Professor!</AlertTitle>
          <AlertDescription>
            Chat with our AI, submit professor links, get personalized recommendations, and analyze sentiment trends.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
            <TabsTrigger value="submit">Submit RMP Link</TabsTrigger>
            <TabsTrigger value="search">Advanced Search</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="bg-white shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Book className="mr-2" /> Chat with AI Assistant
            </h2>
            <div className="h-96 overflow-y-auto mb-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === 'assistant'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-emerald-100 text-emerald-800 ml-auto'
                  } max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : ''}`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow rounded-l-lg border-2 border-indigo-300 p-2 focus:outline-none focus:border-indigo-500"
                placeholder="Ask about a professor..."
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition duration-200"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="submit" className="bg-white shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Link className="mr-2" /> Submit RMP Link
            </h2>
            <div className="flex mb-4">
              <input
                type="text"
                value={rmpLink}
                onChange={(e) => setRmpLink(e.target.value)}
                className="flex-grow rounded-l-lg border-2 border-indigo-300 p-2 focus:outline-none focus:border-indigo-500"
                placeholder="Enter Rate My Professor link..."
              />
              <button
                onClick={submitRmpLink}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition duration-200"
              >
                Submit
              </button>
            </div>
          </TabsContent>

          <TabsContent value="search" className="bg-white shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Search className="mr-2" /> Advanced Search
            </h2>
            <div className="flex mb-4">
              <input
                type="text"
                value={searchCriteria}
                onChange={(e) => setSearchCriteria(e.target.value)}
                className="flex-grow rounded-l-lg border-2 border-indigo-300 p-2 focus:outline-none focus:border-indigo-500"
                placeholder="Enter search criteria (e.g., 'Computer Science, 4+ rating')..."
              />
              <button
                onClick={searchProfessors}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition duration-200"
              >
                Search
              </button>
            </div>
            <div className="space-y-2">
              {recommendations.map((prof, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded-lg">
                  <p className="font-semibold">{prof.name}</p>
                  <p>Rating: {prof.rating}</p>
                  <p>Department: {prof.department}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="bg-white shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="mr-2" /> Sentiment Analysis
            </h2>
            <div className="mb-4 space-y-4">
              <input
                type="text"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full rounded-lg border-2 border-indigo-300 p-2 focus:outline-none focus:border-indigo-500"
                placeholder="Enter professor name"
              />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full rounded-lg border-2 border-indigo-300 p-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="1month">1 Month</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
              </select>
            </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}