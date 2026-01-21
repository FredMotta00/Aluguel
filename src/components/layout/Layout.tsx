import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatBot from '@/components/chat/ChatBot';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Layout;
