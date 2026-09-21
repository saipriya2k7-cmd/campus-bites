import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  IndianRupee, 
  Flame, 
  Clock, 
  Plus, 
  Utensils, 
  MessageSquareCode,
  Check,
  ArrowDown
} from 'lucide-react';
import { FoodItem } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  recommendedFoods?: FoodItem[];
  timestamp: string;
}

interface FoodChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onAddToCart: (food: FoodItem) => void;
  cartItemIds: Record<string, number>;
}

export const FoodChatbot: React.FC<FoodChatbotProps> = ({
  isOpen,
  onClose,
  foods,
  onAddToCart,
  cartItemIds
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hey there! 🎓 I'm BiteBot, your personal campus food buddy. Hungry between lectures? Want pure veg, egg dishes, or chicken? Or need combos under ₹50? Ask me anything!",
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const CRAVING_FILTERS = [
    { label: '🌶️ Spicy Kick', query: 'Show spicy kick items' },
    { label: '🍟 Crispy & Crunchy', query: 'Show crispy and crunchy snacks' },
    { label: '⚡ Quick (<5m)', query: 'Quick bites under 5 mins' },
    { label: '🍛 Hearty Meals', query: 'Hearty and filling meals' },
    { label: '🍫 Sweet Tooth', query: 'Sweet desserts and treats' },
    { label: '🥤 Chilled Drink', query: 'Chilled drinks and cold beverages' },
    { label: '💰 Under ₹50', query: 'Under 50 rupees' },
    { label: '🟢 Pure Veg', query: 'Pure veg items' },
    { label: '🟡 Egg Dishes', query: 'Egg dishes' },
    { label: '🔴 Non-Veg', query: 'Non-veg specials' },
    { label: '🔥 Today\'s Special', query: 'Today special dishes' }
  ];

  // Reliable scroll helper: scrolls only the chatbox viewport, never jumps the outer page/iframe
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Scroll to bottom on updates when user is near bottom or user just posted
  useEffect(() => {
    if (!chatContainerRef.current) return;
    const container = chatContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 160;
    const lastMsg = messages[messages.length - 1];

    if (isNearBottom || lastMsg?.sender === 'user') {
      scrollToBottom(true);
    }
  }, [messages, isTyping]);

  // Initial scroll to bottom when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom(false);
      }, 50);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const container = chatContainerRef.current;
    const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 120;
    setShowScrollBottomBtn(isScrolledUp);
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Smart recommendation engine
    setTimeout(() => {
      const q = query.toLowerCase();
      let replyText = '';
      let matches: FoodItem[] = [];

      // Check for price / under ₹X queries
      const priceMatch = q.match(/under\s*(?:₹|rs\.?|rupees)?\s*(\d+)/i) || q.match(/(\d+)\s*(?:₹|rs|rupees)/i);
      if (priceMatch) {
        const budgetLimit = parseInt(priceMatch[1], 10);
        matches = foods
          .filter((f) => f.price <= budgetLimit && f.availability !== 'sold_out')
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        if (matches.length > 0) {
          replyText = `Awesome! Here are ${matches.length} delicious canteen dishes you can grab under ₹${budgetLimit}. You can add them straight to your tray! 😋`;
        } else {
          replyText = `Hmm, I couldn't find items under ₹${budgetLimit} right now. The most affordable item is ${foods[0]?.name} at ₹${foods[0]?.price}!`;
        }
      } 
      // Pure veg check
      else if (q.includes('pure veg') || (q.includes('veg') && !q.includes('non-veg') && !q.includes('non veg') && !q.includes('egg'))) {
        matches = foods
          .filter((f) => f.dietary === 'veg' && f.availability !== 'sold_out')
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        replyText = "Here are top 🟢 Pure Vegetarian favorites prepared with fresh ingredients:";
      }
      // Egg query
      else if (q.includes('egg') || q.includes('anda') || q.includes('bhurji') || q.includes('omlette') || q.includes('omelette')) {
        matches = foods
          .filter((f) => f.dietary === 'egg' && f.availability !== 'sold_out')
          .slice(0, 4);
        replyText = "Craving protein? 🟡 Here are our freshly prepared egg dishes, from Maggi to rolls:";
      }
      // Non-veg query
      else if (q.includes('non-veg') || q.includes('non veg') || q.includes('chicken') || q.includes('biryani') || q.includes('meat')) {
        matches = foods
          .filter((f) => f.dietary === 'non_veg' && f.availability !== 'sold_out')
          .slice(0, 4);
        replyText = "Here are our delicious 🔴 Non-Veg canteen specials including chicken rolls, biryani, and crispy bites:";
      }
      // Crispy & crunchy craving
      else if (q.includes('crispy') || q.includes('crunch') || q.includes('fried') || q.includes('fries') || q.includes('samosa') || q.includes('pakora') || q.includes('cutlet') || q.includes('puff')) {
        matches = foods
          .filter((f) => ((f.cravings && f.cravings.some(c => c.toLowerCase().includes('crisp'))) || f.name.toLowerCase().includes('crispy') || f.name.toLowerCase().includes('fries') || f.name.toLowerCase().includes('samosa') || f.description.toLowerCase().includes('crispy') || f.description.toLowerCase().includes('crunchy')) && f.availability !== 'sold_out')
          .slice(0, 4);
        replyText = "Craving that golden crunch? 🍟 Here are our freshly fried, crispy canteen snacks:";
      }
      // Hearty & filling craving
      else if (q.includes('hearty') || q.includes('filling') || q.includes('thali') || q.includes('heavy') || q.includes('lunch') || q.includes('dinner') || q.includes('full meal')) {
        matches = foods
          .filter((f) => (f.category === 'Meals' || (f.cravings && f.cravings.some(c => c.toLowerCase().includes('hearty')))) && f.availability !== 'sold_out')
          .slice(0, 4);
        replyText = "Big hunger? 🍛 Here are hearty and wholesome meals to keep you full through your lectures:";
      }
      // Quick prep / hurry / between classes
      else if (q.includes('quick') || q.includes('hurry') || q.includes('class') || q.includes('fast') || q.includes('5 min')) {
        matches = foods
          .filter((f) => (f.prepTime.includes('1') || f.prepTime.includes('2') || f.prepTime.includes('3') || (f.cravings && f.cravings.includes('Quick Bite (<5 mins)'))) && f.availability === 'in_stock')
          .slice(0, 4);
        replyText = "In a rush? These ready-to-serve snacks have minimal prep time (<5 mins) so you don't miss your attendance! ⚡";
      }
      // Spicy craving
      else if (q.includes('spicy') || q.includes('mirchi') || q.includes('teekha') || q.includes('hot')) {
        matches = foods
          .filter((f) => (f.spiceLevel >= 2 || (f.cravings && f.cravings.includes('Spicy Kick'))) && f.availability !== 'sold_out')
          .slice(0, 4);
        replyText = "Craving that fire? 🔥 Here are our top spicy picks with that authentic canteen punch:";
      }
      // Sweet craving
      else if (q.includes('sweet') || q.includes('meetha') || q.includes('dessert') || q.includes('chocolate') || q.includes('brownie') || q.includes('jamun')) {
        matches = foods
          .filter((f) => (f.category === 'Desserts' || (f.cravings && f.cravings.includes('Sweet Tooth'))) && f.availability !== 'sold_out');
        replyText = "Got a sweet tooth? 🍫 Check out these comforting treats to fuel your study session:";
      }
      // Special queries
      else if (q.includes('special') || q.includes('today') || q.includes('chef')) {
        matches = foods.filter((f) => f.isSpecial && f.availability !== 'sold_out');
        replyText = "Here are today's chef specials made fresh in our campus kitchen with exclusive offers! 🔥";
      }
      // Drink / beverage queries
      else if (q.includes('drink') || q.includes('coffee') || q.includes('chai') || q.includes('tea') || q.includes('thirsty') || q.includes('cold')) {
        matches = foods.filter((f) => f.category === 'Beverages' && f.availability !== 'sold_out');
        replyText = "Nothing beats a cold coffee or kadak masala chai on campus! Here are the drinks in stock: 🥤";
      }
      // General match
      else {
        const found = foods.filter((f) => q.includes(f.name.toLowerCase().split(' ')[0]) || f.name.toLowerCase().includes(q));
        if (found.length > 0) {
          matches = found;
          const statusText = found[0].availability === 'in_stock' ? '🟢 In Stock right now!' : found[0].availability === 'making_fresh' ? '🟡 Fresh batch being prepared!' : '🔴 Currently sold out today';
          replyText = `Found "${found[0].name}"! Status: ${statusText} for ₹${found[0].price}.`;
        } else {
          // Default smart recommendations
          matches = foods.filter((f) => f.rating >= 4.7 && f.availability === 'in_stock').slice(0, 3);
          replyText = `Here are student favorites that campus loves right now! You can also ask me for items under ₹40, pure veg, egg snacks, or chicken. 😊`;
        }
      }

      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: replyText,
        recommendedFoods: matches.length > 0 ? matches : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="food-chatbot-modal"
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[88vh] sm:h-[630px] max-h-[92vh] shadow-2xl border border-burgundy-200/80 flex flex-col overflow-hidden relative"
      >
        {/* Header - White & Burgundy Theme */}
        <div className="bg-linear-to-r from-burgundy-950 via-burgundy-900 to-burgundy-800 text-white p-4 flex items-center justify-between shrink-0 shadow-md border-b border-burgundy-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 text-white flex items-center justify-center border border-white/20 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base font-['Outfit'] text-white">BiteBot AI</h3>
                <span className="bg-burgundy-700/80 text-amber-200 border border-burgundy-600 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Guide
                </span>
              </div>
              <p className="text-xs text-burgundy-100/90 font-medium">Campus Food, Cravings & Budget Guide</p>
            </div>
          </div>

          <button
            id="close-chatbot-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-burgundy-200 hover:text-white transition-colors cursor-pointer"
            title="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream Container with proper scrolling and min-h-0 */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 bg-[#FAF7F8] scroll-smooth relative"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-burgundy-900 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-burgundy-100/90 rounded-bl-xs shadow-xs'
                }`}
              >
                <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* Interactive Food Cards inside Chat */}
              {msg.recommendedFoods && msg.recommendedFoods.length > 0 && (
                <div className="mt-2.5 w-full space-y-2 max-w-[94%]">
                  {msg.recommendedFoods.map((food) => {
                    const qty = cartItemIds[food.id] || 0;
                    return (
                      <div
                        key={food.id}
                        className="bg-white rounded-2xl p-2.5 border border-burgundy-100 shadow-xs flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            onError={(e) => handleImageError(e, food.category, food.dietary)}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 truncate">
                              <DietaryBadge dietary={food.dietary} isVeg={food.isVeg} size="sm" />
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {food.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                              <span className="font-black text-burgundy-900 font-['Outfit']">
                                ₹{food.price}
                              </span>
                              <span className="text-slate-400">• {food.prepTime}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          id={`chat-add-${food.id}`}
                          onClick={() => onAddToCart(food)}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            qty > 0
                              ? 'bg-burgundy-900 text-white'
                              : 'bg-burgundy-900 hover:bg-burgundy-950 text-white shadow-xs'
                          }`}
                        >
                          {qty > 0 ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>({qty})</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-burgundy-900 font-medium p-2.5 bg-white rounded-2xl border border-burgundy-100 w-fit shadow-xs">
              <Bot className="w-4 h-4 text-burgundy-700 animate-spin" />
              <span>BiteBot is thinking...</span>
            </div>
          )}
        </div>

        {/* Floating Scroll to Bottom Button when scrolled up */}
        {showScrollBottomBtn && (
          <button
            id="chat-scroll-bottom-btn"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-36 right-5 z-20 bg-burgundy-900 hover:bg-burgundy-950 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-in fade-in"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Latest messages</span>
          </button>
        )}

        {/* Quick Suggestion & Craving Pills - ALL visible on mobile phones without horizontal hidden cutoff */}
        <div className="p-2.5 border-t border-burgundy-100 bg-[#FAF7F8] shrink-0">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-extrabold text-burgundy-900 uppercase tracking-wider flex items-center gap-1">
              <span>✨ Quick Cravings & Filters</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">All visible • Tap to ask</span>
          </div>
          {/* Multi-row wrapping grid so all features (crispy, spicy, quick, etc.) are visible on mobile phones */}
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-0.5 scrollbar-thin">
            {CRAVING_FILTERS.map((filter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(filter.query)}
                className="text-[11px] font-bold text-burgundy-950 bg-white hover:bg-burgundy-900 hover:text-white px-2.5 py-1 rounded-xl transition-all cursor-pointer border border-burgundy-200/90 shadow-2xs active:scale-95 whitespace-nowrap"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-burgundy-100 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            id="chatbot-input-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask BiteBot (e.g. Crispy snacks, Spicy kick, Under ₹50)..."
            className="flex-1 bg-[#FAF7F8] border border-burgundy-200/90 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-burgundy-800 focus:bg-white transition-all font-medium"
          />
          <button
            id="chatbot-send-btn"
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-burgundy-950/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
