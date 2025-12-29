
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Vault from './components/Vault';
import { User, UserRole, MarketplaceEntry, UserNote, NewsEntry } from './types';

// Часы по МСК
const MoscowClock: React.FC = () => {
  const [time, setTime] = useState<string>('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      const moscowTime = new Intl.DateTimeFormat('ru-RU', options).format(now);
      const dateOptions: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit', year: 'numeric' };
      const moscowDate = new Intl.DateTimeFormat('ru-RU', dateOptions).format(now);
      setTime(`${moscowDate} | ${moscowTime} MSK`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="fixed bottom-4 right-6 z-50 pointer-events-none">
      <div className="bg-slate-950/80 backdrop-blur-md border border-purple-500/30 px-4 py-2 rounded-full shadow-lg">
        <span className="text-[10px] font-mono font-black text-purple-400 tracking-widest neon-text">{time}</span>
      </div>
    </div>
  );
};

// Компонент Новостей (Главная)
const Home: React.FC<{ user: User }> = ({ user }) => {
  const [news, setNews] = useState<NewsEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', imageUrl: '' });

  useEffect(() => {
    const saved = localStorage.getItem('rampage_news_v1');
    if (saved) try { setNews(JSON.parse(saved)); } catch (e) {}
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: NewsEntry = {
      id: 'n' + Date.now(),
      title: form.title,
      content: form.content,
      author: user.name,
      date: new Date().toLocaleString('ru-RU'),
      imageUrl: form.imageUrl
    };
    const updated = [newEntry, ...news];
    setNews(updated);
    localStorage.setItem('rampage_news_v1', JSON.stringify(updated));
    setShowAdd(false);
    setForm({ title: '', content: '', imageUrl: '' });
  };

  const deleteNews = (id: string) => {
    if (window.confirm("Удалить эту новость?")) {
      const updated = news.filter(n => n.id !== id);
      setNews(updated);
      localStorage.setItem('rampage_news_v1', JSON.stringify(updated));
    }
  };

  // Публиковать могут только люди с кодом доступа (в нашем случае это админы и замы из baseCodes)
  const canPost = user.hasAccessCode === true;

  return (
    <div className="space-y-10 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter neon-text">Главная</h2>
          <p className="text-purple-400 font-mono text-[10px] tracking-[0.3em] uppercase mt-1">Новости и события синдиката</p>
        </div>
        {canPost && (
          <button onClick={() => setShowAdd(true)} className="bg-purple-600 px-8 py-3 rounded-2xl text-xs font-bold uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] transform hover:scale-105 transition-all">Опубликовать</button>
        )}
      </header>

      <div className="space-y-8">
        {news.map(item => (
          <article key={item.id} className="bg-slate-900/60 border border-purple-900/30 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-xl">
            {item.imageUrl && (
              <div className="w-full h-[400px] overflow-hidden">
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">{item.title}</h3>
                {canPost && (
                  <button onClick={() => deleteNews(item.id)} className="text-red-500 hover:text-red-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
              <div className="flex gap-4 items-center mb-6 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                <span>Автор: {item.author}</span>
                <span className="w-1 h-1 bg-purple-900 rounded-full"></span>
                <span>{item.date}</span>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">{item.content}</p>
            </div>
          </article>
        ))}
        {news.length === 0 && (
          <div className="text-center py-40 border-2 border-dashed border-purple-900/20 rounded-[3rem]">
            <p className="text-slate-600 uppercase font-bold tracking-widest text-sm italic">Тишина в эфире...</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <form onSubmit={handleAdd} className="bg-slate-900 border border-purple-500/50 p-10 rounded-[3rem] max-w-2xl w-full space-y-6 animate-slideUp">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Новая новость</h3>
            <input required placeholder="Заголовок" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-purple-900/30 p-5 rounded-2xl text-white outline-none focus:border-purple-500 text-xl font-bold" />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Изображение (С ПК)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-600 file:text-white" />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-2xl border border-purple-500/30" />}
            </div>
            <textarea required placeholder="Текст новости..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full bg-slate-950 border border-purple-900/30 p-5 rounded-2xl text-white outline-none focus:border-purple-500 min-h-[200px]" />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 text-slate-500 uppercase font-black tracking-widest text-xs">Отмена</button>
              <button type="submit" className="flex-1 bg-purple-600 py-4 rounded-2xl text-white uppercase font-black tracking-widest text-xs shadow-lg">Опубликовать</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Компонент Торговой площадки и Аренды
const MarketView: React.FC<{ type: 'market' | 'rent', user: User }> = ({ type, user }) => {
  const storageKey = `rampage_${type}_v3`;
  const [items, setItems] = useState<MarketplaceEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', price: '', description: '', imageUrl: '' });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) try { setItems(JSON.parse(saved)); } catch (e) {}
  }, [type, storageKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MarketplaceEntry = {
      id: 'm' + Date.now().toString(),
      title: form.title,
      price: form.price,
      description: form.description,
      seller: user.name,
      date: new Date().toLocaleDateString('ru-RU'),
      type,
      imageUrl: form.imageUrl
    };
    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setShowAdd(false);
    setForm({ title: '', price: '', description: '', imageUrl: '' });
  };

  const deleteItem = (id: string) => {
    if (window.confirm("Удалить это объявление?")) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter neon-text">{type === 'market' ? 'Торговая площадка' : 'Аренда'}</h2>
        <button onClick={() => setShowAdd(true)} className="bg-purple-600 px-6 py-2 rounded-xl text-xs font-bold uppercase shadow-lg transform hover:scale-105 transition-all">Выставить</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-slate-900/60 border border-purple-900/40 rounded-2xl relative group overflow-hidden flex flex-col h-full shadow-lg hover:border-purple-500/50 transition-all">
            {item.imageUrl && (
              <div className="h-40 bg-slate-800 overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-white mb-1 uppercase truncate">{item.title}</h3>
              <p className="text-2xl font-black text-purple-400 mb-4">{item.price}</p>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed line-clamp-3 italic flex-1">"{item.description}"</p>
              <div className="flex justify-between items-center pt-4 border-t border-purple-900/20">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{item.seller}</div>
                <div className="flex gap-2">
                  { (user.role === UserRole.ADMIN || user.role === UserRole.EXECUTIVE || item.seller === user.name) && (
                    <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-400 transition-colors p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <form onSubmit={handleAdd} className="bg-slate-900 border border-purple-500/50 p-8 rounded-3xl max-w-md w-full space-y-4 animate-slideUp">
            <h3 className="text-xl font-bold text-white uppercase">Новое объявление</h3>
            <input required placeholder="Название" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-purple-900/30 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
            <input required placeholder="Цена" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-slate-950 border border-purple-900/30 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Фото (С ПК)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-600 file:text-white" />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-purple-500/30" />}
            </div>
            <textarea placeholder="Описание" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-950 border border-purple-900/30 p-4 rounded-xl text-white outline-none focus:border-purple-500 min-h-[80px]" />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 text-slate-500 uppercase font-bold text-[10px]">Отмена</button>
              <button type="submit" className="flex-1 bg-purple-600 py-3 rounded-xl text-white uppercase font-bold text-[10px] shadow-lg hover:bg-purple-500">Создать</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Компонент Управления Пользователями
const UserDirectory: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);

  useEffect(() => {
    const registered = JSON.parse(localStorage.getItem('rampage_registered_users') || '[]');
    setUsers(registered);
    const savedNotes = JSON.parse(localStorage.getItem(`rampage_notes_${currentUser.id}`) || '{}');
    setNotes(savedNotes);
  }, [currentUser.id]);

  const toggleBlock = (userId: string) => {
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.EXECUTIVE) return;
    const updated = users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
    setUsers(updated);
    localStorage.setItem('rampage_registered_users', JSON.stringify(updated));
  };

  const deleteUser = (userId: string) => {
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.EXECUTIVE) return;
    if (window.confirm("ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ДАННОГО ПОЛЬЗОВАТЕЛЯ?")) {
        const updated = users.filter(u => u.id !== userId);
        setUsers(updated);
        localStorage.setItem('rampage_registered_users', JSON.stringify(updated));
    }
  };

  const saveNote = (userId: string, text: string) => {
    const updatedNotes = { ...notes, [userId]: text };
    setNotes(updatedNotes);
    localStorage.setItem(`rampage_notes_${currentUser.id}`, JSON.stringify(updatedNotes));
    setEditingNote(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter neon-text">Пользователи системы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-slate-900/50 border border-purple-900/20 p-6 rounded-2xl flex gap-6 hover:border-purple-500/30 transition-all">
            <img src={u.avatar} className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30 shadow-lg" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white uppercase">{u.name}</h3>
                <div className="flex gap-2">
                  { (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EXECUTIVE) && (
                    <>
                        <button onClick={() => toggleBlock(u.id)} className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${u.isBlocked ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                        {u.isBlocked ? 'Разблокирован' : 'Блокировать'}
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-purple-400 uppercase tracking-widest mt-1">Ранг: {u.role}</p>
              
              <div className="mt-4 pt-4 border-t border-purple-900/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Личная заметка:</span>
                  <button onClick={() => setEditingNote(u.id)} className="text-purple-400 text-[10px] uppercase font-bold hover:text-white">Правка</button>
                </div>
                {editingNote === u.id ? (
                  <div className="space-y-2">
                    <textarea 
                      defaultValue={notes[u.id] || ''} 
                      className="w-full bg-slate-950 border border-purple-900/30 p-3 rounded-lg text-xs text-white outline-none h-20 focus:border-purple-500"
                      id={`note-${u.id}`}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveNote(u.id, (document.getElementById(`note-${u.id}`) as HTMLTextAreaElement).value)} className="bg-purple-600 text-[10px] font-bold px-3 py-1 rounded text-white uppercase">Ок</button>
                      <button onClick={() => setEditingNote(null)} className="text-slate-500 text-[10px] font-bold px-3 py-1 uppercase">Отмена</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic leading-relaxed">
                    {notes[u.id] || 'Пусто...'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ name: '', password: '', code: '' });
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Хардкод коды с аватаром Dominic chicken
  const baseCodes: Record<string, { name: string, role: UserRole, avatar: string }> = {
    'RMP_LDR_MERCEDES_777_X': { name: 'Mercedes_Mangushcar', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mercedes' },
    'RMP_DEP_KOCHERGA_555_Y': { name: 'Kocherga_Rampage', role: UserRole.EXECUTIVE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kocherga' },
    'RMP_DEP_LORD_111_Z': { name: 'Lord_Rampage', role: UserRole.EXECUTIVE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lord' },
    'RMP_DEP_DOMINIC_222_W': { name: 'Dominic_Delgado', role: UserRole.EXECUTIVE, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=chicken' }, 
    'RMP_DEV_INDUSTRIAL_SITE_999': { name: 'Industrial_Rampage', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Industrial' },
  };

  const getAugmentedUser = (u: User) => {
    const overrides = JSON.parse(localStorage.getItem('rampage_avatar_overrides') || '{}');
    if (overrides[u.id || u.name]) {
      return { ...u, avatar: overrides[u.id || u.name] };
    }
    return u;
  };

  useEffect(() => {
    const saved = localStorage.getItem('rampage_current_user_v2');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(getAugmentedUser(u));
      setIsLoggedIn(true);
      setActiveTab('home');
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (view === 'login') {
      const { code, name, password } = formData;
      if (code && baseCodes[code]) {
        const found = { ...baseCodes[code], id: code, email: `${baseCodes[code].name}@rampage.hq`, hasAccessCode: true };
        const final = getAugmentedUser(found);
        setUser(final);
        setIsLoggedIn(true);
        setActiveTab('home');
        localStorage.setItem('rampage_current_user_v2', JSON.stringify(final));
        return;
      }
      const registered: User[] = JSON.parse(localStorage.getItem('rampage_registered_users') || '[]');
      const found = registered.find(u => u.name === name && u.password === password);
      if (found) {
        if (found.isBlocked) {
          setError('АККАУНТ ЗАБЛОКИРОВАН.');
          return;
        }
        const final = getAugmentedUser(found);
        setUser(final);
        setIsLoggedIn(true);
        setActiveTab('home');
        localStorage.setItem('rampage_current_user_v2', JSON.stringify(final));
      } else if (name.toUpperCase() === 'ГОСТЬ' || (name === '' && code === '')) {
        const guest: User = { id: 'guest', name: 'Анонимный Гость', role: UserRole.VIEWER, email: 'guest@rampage.hq', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest', hasAccessCode: false };
        setUser(guest);
        setIsLoggedIn(true);
        setActiveTab('home');
      } else {
        setError('ОШИБКА АВТОРИЗАЦИИ.');
      }
    } else {
      const { name, password } = formData;
      if (name.length < 3 || password.length < 4) {
        setError('КОРОТКИЙ НИК/ПАРОЛЬ.');
        return;
      }
      const registered: User[] = JSON.parse(localStorage.getItem('rampage_registered_users') || '[]');
      if (registered.some(u => u.name === name)) {
        setError('НИК ЗАНЯТ.');
        return;
      }
      const newUser: User = {
        id: 'u' + Date.now(),
        name,
        password,
        role: UserRole.MEMBER,
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`,
        email: `${name}@rampage.net`,
        hasAccessCode: false
      };
      localStorage.setItem('rampage_registered_users', JSON.stringify([...registered, newUser]));
      setUser(newUser);
      setIsLoggedIn(true);
      setActiveTab('home');
      localStorage.setItem('rampage_current_user_v2', JSON.stringify(newUser));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updatedUser = { ...user, avatar: base64 };
        setUser(updatedUser);
        
        const overrides = JSON.parse(localStorage.getItem('rampage_avatar_overrides') || '{}');
        overrides[user.id || user.name] = base64;
        localStorage.setItem('rampage_avatar_overrides', JSON.stringify(overrides));
        
        localStorage.setItem('rampage_current_user_v2', JSON.stringify(updatedUser));
        
        const registered: User[] = JSON.parse(localStorage.getItem('rampage_registered_users') || '[]');
        const updatedList = registered.map(u => u.id === user.id ? { ...u, avatar: base64 } : u);
        localStorage.setItem('rampage_registered_users', JSON.stringify(updatedList));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background text decoration */}
        <div className="bg-text-container">
            {[...Array(15)].map((_, i) => (
                <div key={i} className="bg-rampage-text">RAMPAGE</div>
            ))}
        </div>

        <div className="max-w-md w-full z-10 space-y-8 animate-fadeIn">
          <div className="text-center">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-3xl mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h1 className="text-5xl font-black text-white uppercase tracking-tighter neon-text">RAMPAGE</h1>
          </div>
          <div className="bg-slate-900/80 border border-purple-500/30 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setView('login')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${view === 'login' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}>Вход</button>
              <button onClick={() => setView('register')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${view === 'register' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}>Регистрация</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {view === 'login' ? (
                <>
                  <input placeholder="КЛЮЧ ДОСТУПА" type="password" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-slate-950 border border-purple-900/40 p-4 rounded-2xl text-white font-mono text-xs focus:border-purple-500 outline-none" />
                  <div className="text-center text-[10px] text-slate-600 uppercase font-bold py-2 tracking-widest opacity-50">или</div>
                  <input placeholder="НИКНЕЙМ" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-purple-900/40 p-4 rounded-2xl text-white text-xs outline-none focus:border-purple-500" />
                  <input placeholder="ПАРОЛЬ" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-purple-900/40 p-4 rounded-2xl text-white text-xs outline-none focus:border-purple-500" />
                </>
              ) : (
                <>
                  <input placeholder="НИК" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-purple-900/40 p-4 rounded-2xl text-white text-xs outline-none focus:border-purple-500" />
                  <input placeholder="ПАРОЛЬ" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-purple-900/40 p-4 rounded-2xl text-white text-xs outline-none focus:border-purple-500" />
                </>
              )}
              {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
              <button type="submit" className="w-full bg-purple-600 py-4 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
                {view === 'login' ? 'Войти' : 'Создать'}
              </button>
            </form>
          </div>
        </div>
        <MoscowClock />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950/40 text-slate-200 overflow-hidden relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user!} />
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'home' && <Home user={user!} />}
          {activeTab === 'business' && <Dashboard user={user!} />}
          {activeTab === 'vault' && <Vault user={user!} />}
          {activeTab === 'market' && <MarketView type="market" user={user!} />}
          {activeTab === 'rent' && <MarketView type="rent" user={user!} />}
          {activeTab === 'users' && <UserDirectory currentUser={user!} />}
          
          {activeTab === 'settings' && (
             <div className="bg-slate-900/60 border border-purple-900/30 rounded-[3rem] p-12 max-w-2xl animate-fadeIn shadow-2xl backdrop-blur-sm">
              <h2 className="text-4xl font-black text-white mb-10 uppercase tracking-tighter neon-text">МОЙ ПРОФИЛЬ</h2>
              <div className="space-y-10">
                <div className="flex items-center gap-8">
                  <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                    <img src={user?.avatar} className="w-28 h-28 rounded-3xl border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all group-hover:scale-105 object-cover" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity">
                      <span className="text-[10px] font-bold text-white uppercase text-center">Выбрать<br/>с ПК</span>
                    </div>
                    <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={handleFileChange} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">{user?.name}</h4>
                    <p className="text-purple-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Ранг: {user?.role}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-10 border-t border-purple-900/10">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Личные заметки</h3>
                   <textarea 
                     className="w-full bg-slate-950 border border-purple-900/30 p-6 rounded-3xl text-sm text-slate-300 outline-none h-40 focus:border-purple-500 shadow-inner"
                     placeholder="Тут ваши мысли..."
                     defaultValue={localStorage.getItem(`rampage_self_notes_${user?.id}`) || ''}
                     onChange={(e) => localStorage.setItem(`rampage_self_notes_${user?.id}`, e.target.value)}
                   />
                </div>
                
                <div className="pt-6">
                  <button onClick={() => { localStorage.removeItem('rampage_current_user_v2'); window.location.reload(); }} className="text-red-500 font-black uppercase text-xs tracking-[0.2em] hover:text-red-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    ВЫЙТИ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <MoscowClock />
    </div>
  );
};

export default App;
