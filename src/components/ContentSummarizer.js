import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Shield, AlertTriangle, CheckCircle, Loader, Download, Copy, Check, Moon, Sun } from 'lucide-react';

const ContentSummarizer = ({ isDarkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('file');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [contentType, setContentType] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // API Gateway URL - v2 엔드포인트
  const API_BASE_URL = 'https://wm87smw1ta.execute-api.ap-northeast-2.amazonaws.com/dev';

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['.vtt', '.pdf', '.txt'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(fileExtension)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('지원되는 파일 형식: .vtt, .pdf, .txt');
        setFile(null);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const allowedTypes = ['.vtt', '.pdf', '.txt'];
      const fileExtension = droppedFile.name.toLowerCase().substring(droppedFile.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(fileExtension)) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('지원되는 파일 형식: .vtt, .pdf, .txt');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleSubmit = async () => {
    if (!textInput.trim() && !file) {
      setError('텍스트를 입력하거나 파일을 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;

      if (activeTab === 'text' && textInput.trim()) {
        // 텍스트 직접 입력 API 호출 - content_type 추가
        response = await fetch(`${API_BASE_URL}/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text_input: textInput.trim(),
            content_type: contentType
          })
        });
      } else if (activeTab === 'file' && file) {
        // 파일 업로드의 경우 두 단계로 처리
        // 1. 파일 업로드
        const fileContent = await processFile(file);
        const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_content: fileContent,
            file_name: file.name,
            file_type: file.type || 'text/plain'
          })
        });

        if (!uploadResponse.ok) {
          throw new Error('파일 업로드 실패');
        }

        const uploadResult = await uploadResponse.json();
        
        // 2. 업로드된 파일로 요약 생성 - content_type 추가
        response = await fetch(`${API_BASE_URL}/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_key: uploadResult.file_key,
            content_type: contentType
          })
        });
      }

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      setResult(result);
    } catch (err) {
      setError('요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('API 호출 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 뉴스 타입 전용 렌더링 함수
  const renderNewsArticle = () => {
    if (!result?.structured_summary) return null;

    const { introduction, key_topics } = result.structured_summary;
    
    // 뉴스 기사로 조합 (자연스러운 기사문 형태)
    const fullArticle = `${introduction}\n\n${key_topics?.map(topic => {
      // sub_points가 있으면 자연스럽게 문장에 통합
      const subPointsText = topic.sub_points && topic.sub_points.length > 0 
        ? ` ${topic.sub_points.join(', ')} 등이 주요 내용이다.`
        : '';
      return `${topic.content}${subPointsText}`;
    }).join('\n\n') || ''}`;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-700 relative transition-colors duration-300">
        <button
          onClick={() => copyToClipboard(fullArticle, 'news_article')}
          className="absolute top-4 right-4 p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-300"
          title="뉴스 기사 복사"
        >
          {copiedIndex === 'news_article' ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center transition-colors duration-300">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          뉴스 기사
        </h3>
        
        <div className="pr-10 text-left">
          {/* 완성된 뉴스 기사 - 자연스러운 문단 형태 */}
          <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-gray-600 transition-colors duration-300">
            {/* 리드문 */}
            <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed mb-4 font-medium transition-colors duration-300">
              {introduction}
            </p>
            
            {/* 본문 - 자연스러운 문단들 */}
            {key_topics?.map((topic, index) => (
              <p key={index} className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed mb-4 last:mb-0 transition-colors duration-300">
                {topic.content}
                {/* sub_points를 자연스럽게 문장에 통합 */}
                {topic.sub_points && topic.sub_points.length > 0 && (
                  <span className="text-slate-600 dark:text-gray-400 transition-colors duration-300">
                    {' '}{topic.sub_points.join(', ')} 등이 주요 내용이다.
                  </span>
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 기본/안전 타입용 structured_summary 렌더링
  const renderStructuredSummary = () => {
    if (!result?.structured_summary) return null;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-700 relative transition-colors duration-300">
        <button
          onClick={() => copyToClipboard(`${result.structured_summary?.introduction}\n\n${result.structured_summary?.key_topics?.map(topic => `${topic.number}. ${topic.title}\n${topic.content}\n${topic.sub_points?.map(p => `• ${p}`).join('\n')}`).join('\n\n')}`, 'structured_summary')}
          className="absolute top-4 right-4 p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-300"
          title="정리 내용 복사"
        >
          {copiedIndex === 'structured_summary' ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center transition-colors duration-300">
          <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          세부 요약
        </h3>
        
        {/* Introduction */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-600 text-left transition-colors duration-300">
          <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">
            {result.structured_summary?.introduction}
          </p>
        </div>

        {/* Key Topics */}
        <div className="space-y-4">
          {result.structured_summary?.key_topics?.map((topic, index) => (
            <div key={index} className="text-left">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center transition-colors duration-300">
                <span className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs flex items-center justify-center mr-3 transition-colors duration-300">
                  {topic.number}
                </span>
                {topic.title}
              </h4>
              
              {/* Topic Content */}
              <div className="ml-9 mb-3 text-left">
                <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed mb-3 transition-colors duration-300">
                  {topic.content}
                </p>
                
                {/* Sub Points */}
                <ul className="space-y-1">
                  {topic.sub_points?.map((point, pointIndex) => (
                    <li key={pointIndex} className="text-slate-600 dark:text-gray-400 text-sm flex items-start transition-colors duration-300">
                      <span className="text-indigo-500 dark:text-indigo-400 mr-2 mt-0.5 text-xs">•</span>
                      <span className="text-slate-600 dark:text-gray-400 transition-colors duration-300">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-slate-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-gray-700 shadow-md mr-3 flex items-center justify-center">
                <img 
                  src="/jose.png" 
                  alt="로고"
                  className="w-8 h-8 object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
                <span style={{ fontWeight: '900' }}>TopicCut</span>
              </h1>
            </div>
            
            {/* 다크모드 토글 - 오른쪽 */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="p-2 bg-slate-100 dark:bg-gray-700 rounded-full hover:bg-slate-200 dark:hover:bg-gray-600 transition-all duration-300"
                title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>
            )}
          </div>
          <p className="text-center text-slate-600 dark:text-gray-300 mt-2 transition-colors duration-300">AI Content Analyzer</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-slate-200 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center transition-colors duration-300">
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            콘텐츠 입력
          </h2>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-slate-100 dark:bg-gray-800 rounded-lg p-1 transition-colors duration-300">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-colors duration-300 ${
                activeTab === 'text'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              직접 입력
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-colors duration-300 ${
                activeTab === 'file'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              파일 업로드
            </button>
          </div>

          {/* Content Type Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-3 transition-colors duration-300">요약 스타일 선택</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="basic"
                  checked={contentType === 'basic'}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-gray-300 transition-colors duration-300">기본 요약</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="news"
                  checked={contentType === 'news'}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-gray-300 transition-colors duration-300">뉴스 스타일</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="safety"
                  checked={contentType === 'safety'}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-gray-300 transition-colors duration-300">안전 콘텐츠</span>
              </label>
            </div>
          </div>

          {/* Text Input Tab */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="텍스트를 입력해주세요..."
                className="w-full h-32 p-3 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm transition-colors duration-300"
              />
            </div>
          )}

          {/* File Upload Tab */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 rounded-lg p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-300 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-slate-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-gray-300 mb-2 text-sm transition-colors duration-300">
                  파일을 드래그하여 놓거나 클릭하여 선택하세요
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 transition-colors duration-300">
                  지원 형식: .vtt, .pdf, .txt (최대 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".vtt,.pdf,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {file && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 flex items-center transition-colors duration-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                  <span className="text-emerald-800 dark:text-emerald-300 text-sm transition-colors duration-300">선택된 파일: {file.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-center mt-4 transition-colors duration-300">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-300 text-sm transition-colors duration-300">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!textInput.trim() && !file)}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center text-sm"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                AI 요약 생성
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-700 relative transition-colors duration-300">
              <button
                onClick={() => copyToClipboard(result.title, 'title')}
                className="absolute top-4 right-4 p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-300"
                title="제목 복사"
              >
                {copiedIndex === 'title' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center transition-colors duration-300">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                제목
              </h3>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white pr-10 text-left transition-colors duration-300">{result.title}</h2>
            </div>

            {/* Keywords */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-700 relative transition-colors duration-300">
              <button
                onClick={() => copyToClipboard(result.keywords?.map(k => `#${k}`).join(' '), 'keywords')}
                className="absolute top-4 right-4 p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-300"
                title="키워드 복사"
              >
                {copiedIndex === 'keywords' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center transition-colors duration-300">
                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                키워드
              </h3>
              <div className="flex flex-wrap gap-2 pr-10 justify-start">
                {result.keywords?.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* 조건부 렌더링: 뉴스 타입은 Core Summary 생략 */}
            {contentType !== 'news' && result.core_summary && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-700 relative transition-colors duration-300">
                <button
                  onClick={() => copyToClipboard(`${result.core_summary?.main_question}\n${result.core_summary?.main_answer}\n\n${result.core_summary?.sub_question}\n${result.core_summary?.key_points?.map(p => `• ${p}`).join('\n')}${result.core_summary?.safety_tips ? '\n\n안전 팁:\n' + result.core_summary.safety_tips.map(tip => `• ${tip}`).join('\n') : ''}`, 'core_summary')}
                  className="absolute top-4 right-4 p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-300"
                  title="핵심 요약 복사"
                >
                  {copiedIndex === 'core_summary' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center transition-colors duration-300">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  핵심 요약
                </h3>
                
                {/* Main Question */}
                <div className="mb-6 pr-10 text-left">
                  <div className="flex items-start mb-3">
                    <span className="text-red-500 mr-2 mt-0.5">📌</span>
                    <h4 className="font-semibold text-slate-800 dark:text-white transition-colors duration-300">
                      {result.core_summary?.main_question}
                    </h4>
                  </div>
                  <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed ml-6 transition-colors duration-300">
                    {result.core_summary?.main_answer}
                  </p>
                </div>

                {/* Sub Question */}
                <div className="mb-6 pr-10 text-left">
                  <div className="flex items-start mb-3">
                    <span className="text-blue-500 mr-2 mt-0.5">💡</span>
                    <h4 className="font-semibold text-slate-800 dark:text-white transition-colors duration-300">
                      {result.core_summary?.sub_question}
                    </h4>
                  </div>
                  <ul className="ml-6 space-y-2">
                    {result.core_summary?.key_points?.map((point, index) => (
                      <li key={index} className="text-slate-700 dark:text-gray-300 text-sm flex items-start transition-colors duration-300">
                        <span className="text-slate-400 dark:text-gray-500 mr-2 mt-0.5">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safety Tips - 안전 콘텐츠 선택 시만 표시 */}
                {result.core_summary?.safety_tips && (
                  <div className="pr-10 text-left">
                    <div className="flex items-start mb-3">
                      <span className="text-green-500 mr-2 mt-0.5">🛡️</span>
                      <h4 className="font-semibold text-slate-800 dark:text-white transition-colors duration-300">
                        안전 팁
                      </h4>
                    </div>
                    <ul className="ml-6 space-y-2">
                      {result.core_summary.safety_tips.map((tip, index) => (
                        <li key={index} className="text-slate-700 dark:text-gray-300 text-sm flex items-start transition-colors duration-300">
                          <span className="text-green-500 mr-2 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Structured Summary - 타입별 조건부 렌더링 */}
            {contentType === 'news' ? renderNewsArticle() : renderStructuredSummary()}
          </div>
        )}
      </main>

      {/* Banner Section */}
      <section className="bg-white dark:bg-gray-900 py-8 mt-16 border-t border-slate-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Banner 1 */}
            <div className="flex justify-center">
              <a 
                href="https://youtu.be/6qHKNr1CgVw?feature=shared" 
                className="block rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  src="/vod.png" 
                  alt="CloudPlex Media"
                  className="w-full h-auto"
                />
              </a>
            </div>
            
            {/* Banner 2 */}
            <div className="flex justify-center">
              <a 
                href="https://help.cloudplex.megazone.io/hc/ko" 
                className="block rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  src="/support.png" 
                  alt="Support Portal"
                  className="w-full h-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 dark:bg-gray-950 text-white py-8 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-300 dark:text-gray-400 transition-colors duration-300">
            © Copyright 2025. MEGAZONECLOUD Corp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContentSummarizer;