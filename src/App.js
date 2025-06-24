import React, { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import { Moon, Sun } from 'lucide-react';
import ContentSummarizer from './components/ContentSummarizer';
import './App.css';

function App() {
  const auth = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 로컬스토리지에서 다크모드 설정 불러오기 (기본값: true)
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 다크모드 상태 변경 시 HTML 클래스 업데이트
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 개발 모드 처리
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    return (
      <div className={`App animate-fade-in ${isDarkMode ? 'dark' : ''}`}>
        {/* 개발 모드 헤더 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 text-center">
          🔧 개발 모드 - 인증 건너뛰기
        </div>
        <ContentSummarizer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    );
  }

  const signOutRedirect = () => {
    const clientId = "od1ca3on738fo0onip41qev8o";
    const logoutUri = window.location.origin;
    const cognitoDomain = "https://ap-northeast-2skxje5knv.auth.ap-northeast-2.amazoncognito.com";
    
    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
      <div className={`App min-h-screen flex items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 min-h-screen w-full flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl text-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className={`App min-h-screen flex items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 min-h-screen w-full flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl text-center max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">오류가 발생했습니다</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{auth.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <div className={`App animate-fade-in ${isDarkMode ? 'dark' : ''}`}>
        {/* 개선된 헤더 */}
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 text-white p-5 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center backdrop-blur">
                <img 
                  src="/jose_logo.png" 
                  alt="로고"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm opacity-90">
                  안녕하세요, {auth.user?.profile.email}님!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 다크모드 토글 */}
              <button
                onClick={toggleDarkMode}
                className="p-2 bg-white/20 dark:bg-white/10 rounded-full hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 backdrop-blur"
                title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              
              {/* 로그아웃 버튼 */}
              <button 
                onClick={() => signOutRedirect()}
                className="bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 backdrop-blur"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>
        
        {/* 기존 컴포넌트 */}
        <ContentSummarizer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    );
  }

  // 개선된 로그인 페이지
  return (
    <div className={`App min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-black dark:via-gray-900 dark:to-black min-h-screen flex items-center justify-center p-5">
        {/* 다크모드 토글 - 상단 우측 */}
        <button
          onClick={toggleDarkMode}
          className="fixed top-5 right-5 p-3 bg-white/20 dark:bg-white/10 rounded-full hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 backdrop-blur text-white z-10"
          title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-2xl text-center max-w-md w-full backdrop-blur">
          {/* 로고 */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <img 
              src="/jose_logo.png" 
              alt="로고"
              className="w-12 h-12 object-contain"
            />
          </div>
          
          {/* 제목 - TopicCut으로 변경 */}
          <h1 className="text-gray-900 dark:text-white text-3xl font-black mb-3">
            TopicCut
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-base mb-8 leading-relaxed">
            AI 기반 콘텐츠 분석 및 요약 서비스를<br />
            이용하시려면 로그인해주세요.
          </p>
          
          {/* 로그인 버튼 */}
          <button 
            onClick={() => auth.signinRedirect()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white px-8 py-4 rounded-full text-base font-semibold w-full hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            🔐 로그인하기
          </button>
          
          {/* 추가 정보 */}
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-6 leading-relaxed">
            계정이 없으시다면<br />
            가입 신청 후 사용해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;