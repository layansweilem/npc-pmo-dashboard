import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Clock, FileText, Sparkles, Download, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projects } from '../data/mockData';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Memory {
  id: string;
  query: string;
  summary: string;
  timestamp: Date;
}


export function AIAssistant() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'reports'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: language === 'ar' 
        ? 'مرحبا! أنا مساعد PMO الذكي. كيف يمكنني مساعدتك؟'
        : 'Hello ! Im your PMO AI Assistant . How can i help you?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [downloadingPage, setDownloadingPage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions
  const suggestedQuestions = language === 'ar' 
    ? [
        'ما هي المشاريع المتأخرة؟',
        'أظهر لي ملخص الميزانية',
        'ما هي المخاطر الحرجة؟',
        'كيف هو أداء المحفظة؟',
      ]
    : [
        'What projects are delayed?',
        'Show me budget summary',
        'What are the critical risks?',
        'How is portfolio performing?',
      ];

  // Sample memories
  const [memories] = useState<Memory[]>([
    {
      id: '1',
      query: language === 'ar' ? 'ما هي المشاريع المعرضة للخطر؟' : 'What projects are at risk?',
      summary: language === 'ar' ? '8 مشاريع معرضة للخطر مع تركيز على Phoenix ERP' : '8 projects at risk with focus on Phoenix ERP',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      query: language === 'ar' ? 'تحليل استخدام الميزانية' : 'Budget utilization analysis',
      summary: language === 'ar' ? 'الإنفاق الزائد بمقدار 12 مليون دولار عبر 5 مشاريع' : '$12M overspend across 5 projects',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      query: language === 'ar' ? 'أداء فريق Sarah Chen' : 'Sarah Chen\'s team performance',
      summary: language === 'ar' ? 'ثقة التسليم 92% عبر 4 مشاريع' : '92% delivery confidence across 4 projects',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ]);


  const downloadablePages = [
    {
      id: 'executive-overview',
      path: '/',
      titleEn: 'Executive Overview',
      titleAr: 'نظرة عامة تنفيذية',
      descEn: 'Portfolio health, financial performance, milestone delivery KPIs and charts',
      descAr: 'صحة المحفظة، الأداء المالي، مؤشرات تسليم المعالم والرسوم البيانية',
      icon: '📊',
    },
    {
      id: 'portfolio-deep-dive',
      path: '/portfolio-deep-dive',
      titleEn: 'Portfolio Deep Dive',
      titleAr: 'تحليل المحفظة المعمق',
      descEn: 'Detailed project analysis, risk concentration, and classification breakdown',
      descAr: 'تحليل تفصيلي للمشاريع، تركيز المخاطر، وتصنيف التوزيع',
      icon: '🔍',
    },
    {
      id: 'project-manager',
      path: '/project-manager',
      titleEn: 'Project Manager View',
      titleAr: 'عرض مدير المشروع',
      descEn: 'Project metrics, milestones, task-level blockers and dependency risks',
      descAr: 'مقاييس المشروع، المعالم، عوائق المهام ومخاطر التبعيات',
      icon: '👤',
    },
    {
      id: 'project-details',
      path: '/project-details',
      titleEn: 'Project Details',
      titleAr: 'تفاصيل المشروع',
      descEn: 'Task-level bottleneck identification with governance section',
      descAr: 'تحديد اختناقات المهام مع قسم الحوكمة',
      icon: '📋',
    },
  ];

  const handleDownloadPDF = async (pageId: string) => {
    setDownloadingPage(pageId);

    try {
      setIsOpen(false);

      await new Promise(resolve => setTimeout(resolve, 500));

      const mainContent = document.querySelector('main') || document.querySelector('#root');
      if (!mainContent) {
        throw new Error('Page content not found');
      }

      const canvas = await html2canvas(mainContent as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9fafb',
        scrollY: -window.scrollY,
        windowHeight: document.documentElement.scrollHeight,
        height: document.documentElement.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdfWidth = 297;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, Math.min(pdfHeight, 5000)],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const page = downloadablePages.find(p => p.id === pageId);
      const fileName = `PMO_${page?.titleEn.replace(/\s+/g, '_') || pageId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      setIsOpen(true);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setIsOpen(true);
    } finally {
      setDownloadingPage(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userQuery: string): string => {
    const query = userQuery.toLowerCase();
    
    // Calculate real metrics from projects
    const totalProjects = projects.length;
    const onTrack = projects.filter(p => p.status === 'on-track').length;
    const atRisk = projects.filter(p => p.status === 'at-risk').length;
    const critical = projects.filter(p => p.status === 'critical').length;
    const avgConfidence = Math.round(projects.reduce((sum, p) => sum + p.deliveryConfidence, 0) / totalProjects);
    const totalRisks = projects.reduce((sum, p) => sum + p.openRisks, 0);
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0) / 1000000;
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0) / 1000000;
    const highRiskProjects = projects.filter(p => p.openRisks >= 6);

    // English responses
    if (language === 'en') {
      if (query.includes('risk') || query.includes('at risk')) {
        return `Based on current data, **${atRisk + critical} projects** are at risk or critical:\n\n**Critical (${critical}):**\n${projects.filter(p => p.status === 'critical').map(p => `• ${p.name} - ${p.openRisks} open risks`).join('\n')}\n\n**At Risk (${atRisk}):**\n${projects.filter(p => p.status === 'at-risk').slice(0, 3).map(p => `• ${p.name} - ${p.openRisks} open risks`).join('\n')}\n\nI recommend immediate intervention on critical projects.`;
      }
      
      if (query.includes('budget') || query.includes('cost') || query.includes('financial')) {
        const variance = totalSpent - totalBudget;
        return `**Financial Overview:**\n\n• Total Budget: $${totalBudget.toFixed(1)}M\n• Total Spent: $${totalSpent.toFixed(1)}M\n• Variance: ${variance > 0 ? '+' : ''}$${variance.toFixed(1)}M\n• Average CPI: ${(projects.reduce((sum, p) => sum + p.cpi, 0) / totalProjects).toFixed(2)}\n\n${variance > 0 ? '⚠️ Portfolio is over budget. Review high-spend projects.' : '✅ Portfolio is within budget.'}`;
      }
      
      if (query.includes('confidence') || query.includes('delivery')) {
        return `**Delivery Confidence Analysis:**\n\n• Portfolio Average: **${avgConfidence}%**\n• High Confidence (≥80%): ${projects.filter(p => p.deliveryConfidence >= 80).length} projects\n• Medium Confidence (60-79%): ${projects.filter(p => p.deliveryConfidence >= 60 && p.deliveryConfidence < 80).length} projects\n• Low Confidence (<60%): ${projects.filter(p => p.deliveryConfidence < 60).length} projects\n\nFocus on improving the ${projects.filter(p => p.deliveryConfidence < 60).length} low-confidence projects.`;
      }
      
      if (query.includes('top') || query.includes('best') || query.includes('performing')) {
        const topProjects = projects
          .filter(p => p.status === 'on-track')
          .sort((a, b) => b.deliveryConfidence - a.deliveryConfidence)
          .slice(0, 5);
        return `**Top Performing Projects:**\n\n${topProjects.map((p, i) => `${i + 1}. **${p.name}**\n   • PM: ${p.projectManager}\n   • Confidence: ${p.deliveryConfidence}%\n   • SPI: ${p.spi} | CPI: ${p.cpi}`).join('\n\n')}`;
      }
      
      if (query.includes('recommend') || query.includes('suggest') || query.includes('action')) {
        return `**Recommended Actions:**\n\n1. **Immediate:** Address ${critical} critical projects with intervention meetings\n2. **This Week:** Review ${highRiskProjects.length} high-risk projects (6+ open risks)\n3. **Resource Planning:** Resolve over-allocation in ${projects.filter(p => p.status === 'at-risk').length} projects\n4. **Financial Review:** Investigate budget variance of $${(totalSpent - totalBudget).toFixed(1)}M\n5. **Milestone Tracking:** Focus on ${projects.filter(p => p.milestoneAdherence < 80).length} projects with low milestone adherence`;
      }
      
      if (query.includes('report') || query.includes('summary') || query.includes('overview')) {
        return `**Portfolio Executive Summary:**\n\n📊 **Status Distribution:**\n• On Track: ${onTrack} (${Math.round(onTrack/totalProjects*100)}%)\n• At Risk: ${atRisk} (${Math.round(atRisk/totalProjects*100)}%)\n• Critical: ${critical} (${Math.round(critical/totalProjects*100)}%)\n\n💰 **Financial Health:**\n• Budget: $${totalBudget.toFixed(1)}M | Spent: $${totalSpent.toFixed(1)}M\n• Variance: ${totalSpent > totalBudget ? '+' : ''}$${(totalSpent - totalBudget).toFixed(1)}M\n\n⚠️ **Risk Exposure:**\n• Total Open Risks: ${totalRisks}\n• High-Risk Projects: ${highRiskProjects.length}\n\n🎯 **Delivery Confidence:** ${avgConfidence}%`;
      }
      
      return `I can help you with portfolio analysis. Try asking:\n\n• "What projects are at risk?"\n• "Show me budget status"\n• "What's our delivery confidence?"\n• "Recommend actions for this week"\n• "Generate executive summary"\n• "Show top performing projects"`;
    } 
    
    // Arabic responses
    else {
      if (query.includes('خطر') || query.includes('مخاطر')) {
        return `بناءً على البيانات الحالية، **${atRisk + critical} مشروع** معرض للخطر أو حرج:\n\n**حرج (${critical}):**\n${projects.filter(p => p.status === 'critical').map(p => `• ${p.name} - ${p.openRisks} مخاطر مفتوحة`).join('\n')}\n\n**معرض للخطر (${atRisk}):**\n${projects.filter(p => p.status === 'at-risk').slice(0, 3).map(p => `• ${p.name} - ${p.openRisks} مخاطر مفتوحة`).join('\n')}\n\nأوصي بالتدخل الفوري في المشاريع الحرجة.`;
      }
      
      if (query.includes('ميزانية') || query.includes('تكلفة') || query.includes('مالي')) {
        const variance = totalSpent - totalBudget;
        return `**نظرة عامة مالية:**\n\n• إجمالي الميزانية: ${totalBudget.toFixed(1)} مليون دولار\n• إجمالي المنفق: ${totalSpent.toFixed(1)} مليون دولار\n• الفرق: ${variance > 0 ? '+' : ''}${variance.toFixed(1)} مليون دولار\n• متوسط CPI: ${(projects.reduce((sum, p) => sum + p.cpi, 0) / totalProjects).toFixed(2)}\n\n${variance > 0 ? '⚠️ المحفظة تجاوزت الميزانية. راجع المشاريع عالية الإنفاق.' : '✅ المحفظة ضمن الميزانية.'}`;
      }
      
      if (query.includes('ثقة') || query.includes('تسليم')) {
        return `**تحليل ثقة التسليم:**\n\n• متوسط المحفظة: **${avgConfidence}%**\n• ثقة عالية (≥80%): ${projects.filter(p => p.deliveryConfidence >= 80).length} مشروع\n• ثقة متوسطة (60-79%): ${projects.filter(p => p.deliveryConfidence >= 60 && p.deliveryConfidence < 80).length} مشروع\n• ثقة منخفضة (<60%): ${projects.filter(p => p.deliveryConfidence < 60).length} مشروع\n\nركز على تحسين ${projects.filter(p => p.deliveryConfidence < 60).length} مشروع منخفض الثقة.`;
      }
      
      if (query.includes('أفضل') || query.includes('أعلى')) {
        const topProjects = projects
          .filter(p => p.status === 'on-track')
          .sort((a, b) => b.deliveryConfidence - a.deliveryConfidence)
          .slice(0, 5);
        return `**أفضل المشاريع أداءً:**\n\n${topProjects.map((p, i) => `${i + 1}. **${p.name}**\n   • المدير: ${p.projectManager}\n   • الثقة: ${p.deliveryConfidence}%\n   • SPI: ${p.spi} | CPI: ${p.cpi}`).join('\n\n')}`;
      }
      
      if (query.includes('توصية') || query.includes('اقترح') || query.includes('إجراء')) {
        return `**الإجراءات الموصى بها:**\n\n1. **فوري:** معالجة ${critical} مشروع حرج باجتماعات تدخل\n2. **هذا الأسبوع:** مراجعة ${highRiskProjects.length} مشروع عالي المخاطر (6+ مخاطر مفتوحة)\n3. **تخطيط الموارد:** حل التخصيص الزائد في ${projects.filter(p => p.status === 'at-risk').length} مشروع\n4. **مراجعة مالية:** التحقق من فرق الميزانية ${(totalSpent - totalBudget).toFixed(1)} مليون دولار\n5. **تتبع المعالم:** التركيز على ${projects.filter(p => p.milestoneAdherence < 80).length} مشروع بالتزام منخفض`;
      }
      
      if (query.includes('تقرير') || query.includes('ملخص') || query.includes('نظرة')) {
        return `**ملخص تنفيذي للمحفظة:**\n\n📊 **توزيع الحالة:**\n• على المسار: ${onTrack} (${Math.round(onTrack/totalProjects*100)}%)\n• معرض للخطر: ${atRisk} (${Math.round(atRisk/totalProjects*100)}%)\n• حرج: ${critical} (${Math.round(critical/totalProjects*100)}%)\n\n💰 **الصحة المالية:**\n• الميزانية: ${totalBudget.toFixed(1)} م.د | المنفق: ${totalSpent.toFixed(1)} م.د\n• الفرق: ${totalSpent > totalBudget ? '+' : ''}${(totalSpent - totalBudget).toFixed(1)} م.د\n\n⚠️ **التعرض للمخاطر:**\n• إجمالي المخاطر المفتوحة: ${totalRisks}\n• مشاريع عالية المخاطر: ${highRiskProjects.length}\n\n🎯 **ثقة التسليم:** ${avgConfidence}%`;
      }
      
      return `يمكنني مساعدتك في تحليل المحفظة. جرب السؤال:\n\n• "ما هي المشاريع المعرضة للخطر؟"\n• "أظهر لي حالة الميزانية"\n• "ما هي ثقة التسليم لدينا؟"\n• "أوصي بإجراءات لهذا الأسبوع"\n• "إنشاء ملخص تنفيذي"\n• "أظهر أفضل المشاريع أداءً"`;
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(textToSend),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (language === 'ar') {
      if (days > 0) return `منذ ${days} يوم`;
      if (hours > 0) return `منذ ${hours} ساعة`;
      return 'الآن';
    } else {
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return 'Just now';
    }
  };


  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg shadow-lg transition-all px-[16px] py-[4px]"
        style={{ 
          background: isOpen ? '#A29475' : '#8A1538',
          color: 'white'
        }}
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5" />
            <span className="font-medium">{language === 'ar' ? 'إغلاق المساعد' : 'Close AI'}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">{language === 'ar' ? 'مساعد PMO الذكي' : 'PMO AI Assistant'}</span>
          </>
        )}
      </button>

      {/* AI Panel */}
      {isOpen && (
        <div 
          className="fixed top-0 left-0 right-0 z-40 bg-white shadow-xl border-b-2 transition-all duration-300"
          style={{ 
            height: '500px',
            borderColor: '#8A1538'
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div 
              className="px-6 py-4 text-white flex items-center justify-between"
              style={{ background: '#8A1538' }}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {language === 'ar' ? 'مساعد PMO الذكي' : 'PMO AI Assistant'}
                  </h3>
                  <p className="text-sm text-white/80">
                    {language === 'ar' 
                      ? 'مدعوم بتحليلات متقدمة للمحفظة' 
                      : 'Powered by Advanced Portfolio Analytics'}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'chat' 
                      ? 'bg-white text-[#8A1538]' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {language === 'ar' ? 'محادثة' : 'Chat'}
                </button>
                <button
                  onClick={() => setActiveTab('memory')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'memory' 
                      ? 'bg-white text-[#8A1538]' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  {language === 'ar' ? 'الذاكرة' : 'Memory'}
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'reports' 
                      ? 'bg-white text-[#8A1538]' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  {language === 'ar' ? 'تقارير' : 'Reports'}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-[#8A1538] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div 
                            className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={language === 'ar' ? 'اسأل عن المحفظة...' : 'Ask about your portfolio...'}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-transparent"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#8A1538' }}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    {showSuggestions && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">{language === 'ar' ? 'أسئلة مقترحة:' : 'Suggested Questions:'}</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedQuestions.map((question, index) => (
                            <button
                              key={index}
                              onClick={() => handleSend(question)}
                              className="px-3 py-2 rounded-full text-sm font-medium text-white bg-[#8A1538] hover:bg-[#A29475] transition-colors shadow-sm"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Memory Tab */}
              {activeTab === 'memory' && (
                <div className="h-full overflow-y-auto p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {language === 'ar' ? 'الاستفسارات الأخيرة' : 'Recent Queries'}
                  </h4>
                  <div className="space-y-3">
                    {memories.map((memory) => (
                      <div
                        key={memory.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                        onClick={() => {
                          setActiveTab('chat');
                          setInput(memory.query);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{memory.query}</p>
                            <p className="text-sm text-gray-600 mt-1">{memory.summary}</p>
                          </div>
                          <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{formatTime(memory.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="h-full overflow-y-auto p-6">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {language === 'ar' ? 'تصدير الصفحات كـ PDF' : 'Export Pages as PDF'}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    {language === 'ar'
                      ? 'اختر أي صفحة لتنزيلها كملف PDF. انتقل إلى الصفحة أولاً ثم اضغط تنزيل.'
                      : 'Select any page to download as a PDF file. Navigate to the page first, then click download.'}
                  </p>
                  <div className="space-y-3">
                    {downloadablePages.map((page) => {
                      const isCurrentPage = window.location.pathname === page.path || 
                        (page.path === '/' && window.location.pathname === '');
                      return (
                        <div
                          key={page.id}
                          className={`bg-white rounded-lg p-4 border-2 transition-all ${
                            isCurrentPage ? 'border-[#8A1538]/30 bg-[#8A1538]/5' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{page.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-gray-900">
                                  {language === 'ar' ? page.titleAr : page.titleEn}
                                </h5>
                                {isCurrentPage && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#8A1538]/10 text-[#8A1538]">
                                    {language === 'ar' ? 'الصفحة الحالية' : 'Current Page'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {language === 'ar' ? page.descAr : page.descEn}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (isCurrentPage) {
                                  handleDownloadPDF(page.id);
                                } else {
                                  window.location.href = page.path;
                                }
                              }}
                              disabled={downloadingPage === page.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-70"
                              style={{ background: isCurrentPage ? '#8A1538' : '#6B7280' }}
                            >
                              {downloadingPage === page.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  {language === 'ar' ? 'جاري...' : 'Exporting...'}
                                </>
                              ) : isCurrentPage ? (
                                <>
                                  <Download className="w-4 h-4" />
                                  {language === 'ar' ? 'تنزيل PDF' : 'Download PDF'}
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4" />
                                  {language === 'ar' ? 'انتقل أولاً' : 'Go to Page'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}