import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Auth/AuthContext';
import Main from './layout/layoutMain';
import Home from './pages/Home';
import Post from './components/Post';
import CreatePost from './pages/CreatePost';
import Rules from './pages/Rule';
import LoginPage from './pages/loginRegister';
import NotificationPage from './pages/NotificationPage';
import ParticipationHistory from './pages/ParticipationHistory';
import EventDetailPage from './pages/DetailPage';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Index from './pages/Index';
import EditPostGamePage from './pages/EditPostGamePage ';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index element={<Home />} />
            <Route path="rules" element={<Rules />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="post" element={<Post />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="notifications" element={<NotificationPage />} />
            <Route path="participation-history" element={<ParticipationHistory />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="edit-event/:id" element={<EditPostGamePage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="index" element={<Index />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
