import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar/Sidebar';

export const metadata: Metadata = {
  title: 'BDW Gaming Portal — 2000+ Free Online Games',
  description:
    'Play 2000+ free online games instantly on BDW Gaming Portal. Action, puzzle, racing, sports and more — no download required.',
  keywords: 'BDW gaming portal, free online games, browser games, play games online',
  openGraph: {
    title: 'BDW Gaming Portal — 2000+ Free Online Games',
    description: 'Play thousands of free online games instantly in your browser on BDW Gaming Portal.',
    type: 'website',
  },
};

import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal/AuthModal';
import EditProfileModal from '@/components/EditProfileModal/EditProfileModal';
import MissionsModal from '@/components/MissionsModal/MissionsModal';
import LevelUpModal from '@/components/LevelUpModal/LevelUpModal';
import SiteFeedbackModal from '@/components/SiteFeedbackModal/SiteFeedbackModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
          <AuthModal />
          <EditProfileModal />
          <MissionsModal />
          <LevelUpModal />
          <SiteFeedbackModal />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered');
                  }, function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>

    </html>
  );
}
