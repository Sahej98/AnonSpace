import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { useToast } from '../hooks/useToast.js';
import {
  Bell,
  LogOut,
  Copy,
  BookOpen,
  Info,
  ChevronRight,
  Eye,
  Moon,
  Sun,
} from 'lucide-react';

const DARK_THEMES = [
  { id: 'dark', name: 'Midnight', colors: ['#050507', '#6366f1'] },
  { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#050014', '#ff00dd'] },
  { id: 'dracula', name: 'Dracula', colors: ['#282a36', '#bd93f9'] },
  { id: 'monokai', name: 'Monokai', colors: ['#272822', '#a6e22e'] },
  { id: 'nord', name: 'Nord', colors: ['#2e3440', '#88c0d0'] },
  { id: 'solarized-dark', name: 'Solar. Dark', colors: ['#002b36', '#2aa198'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0f172a', '#38bdf8'] },
  { id: 'forest', name: 'Forest', colors: ['#1a2f1a', '#4ade80'] },
  { id: 'sunset', name: 'Sunset', colors: ['#2a1b1b', '#fb923c'] },
  { id: 'coffee', name: 'Coffee', colors: ['#2c241b', '#d4a373'] },
  { id: 'terminal', name: 'Terminal', colors: ['#000000', '#00ff00'] },
  { id: 'high-contrast', name: 'Hi-Contrast', colors: ['#000000', '#ffff00'] },
  { id: 'slate', name: 'Slate', colors: ['#1e293b', '#94a3b8'] },
  { id: 'navy', name: 'Navy', colors: ['#0a192f', '#64ffda'] },
  { id: 'maroon', name: 'Maroon', colors: ['#2b0a0a', '#dc2626'] },
  { id: 'gold', name: 'Gold', colors: ['#1c1905', '#eab308'] },
  { id: 'ultraviolet', name: 'Ultraviolet', colors: ['#1a0b2e', '#7c3aed'] },
  { id: 'synthwave', name: 'Synthwave', colors: ['#2b213a', '#01cdfe'] },
  { id: 'matrix', name: 'Matrix', colors: ['#0d0208', '#00ff41'] },
  { id: 'fire', name: 'Fire', colors: ['#1a0500', '#ff4500'] },
  { id: 'earth', name: 'Earth', colors: ['#1c1815', '#a8a29e'] },
  { id: 'deep-space', name: 'Deep Space', colors: ['#000000', '#3f51b5'] },
  { id: 'abyss', name: 'Abyss', colors: ['#020202', '#212121'] },
  { id: 'void', name: 'Void', colors: ['#000000', '#ffffff'] },
];

const LIGHT_THEMES = [
  { id: 'light', name: 'Daylight', colors: ['#f8fafc', '#4f46e5'] },
  { id: 'pastel', name: 'Pastel', colors: ['#fff0f5', '#f472b6'] },
  {
    id: 'solarized-light',
    name: 'Solar. Light',
    colors: ['#fdf6e3', '#268bd2'],
  },
  { id: 'lavender', name: 'Lavender', colors: ['#f3e8ff', '#a855f7'] },
  { id: 'mint', name: 'Mint', colors: ['#f0fdf4', '#22c55e'] },
  { id: 'rose', name: 'Rose', colors: ['#fff1f2', '#e11d48'] },
  { id: 'sky', name: 'Sky', colors: ['#f0f9ff', '#0284c7'] },
  { id: 'olive', name: 'Olive', colors: ['#f7fee7', '#65a30d'] },
  { id: 'lemon', name: 'Lemon', colors: ['#fef9c3', '#ca8a04'] },
  { id: 'peach', name: 'Peach', colors: ['#fff7ed', '#f97316'] },
  { id: 'lilac', name: 'Lilac', colors: ['#f5f3ff', '#8b5cf6'] },
  { id: 'cream', name: 'Cream', colors: ['#fffbeb', '#d97706'] },
  { id: 'paper', name: 'Paper', colors: ['#f5f5f4', '#57534e'] },
  { id: 'latte', name: 'Latte', colors: ['#fdfbf7', '#8d6e63'] },
  { id: 'blossom', name: 'Blossom', colors: ['#fff0f5', '#db2777'] },
  { id: 'arctic', name: 'Arctic', colors: ['#f0f8ff', '#0077be'] },
  { id: 'sand', name: 'Sand', colors: ['#fdf5e6', '#8d6e63'] },
  { id: 'ice', name: 'Ice', colors: ['#f0ffff', '#00acc1'] },
  { id: 'cloud', name: 'Cloud', colors: ['#f8f9fa', '#adb5bd'] },
  { id: 'ivory', name: 'Ivory', colors: ['#fffff0', '#795548'] },
  { id: 'linen', name: 'Linen', colors: ['#fbf5ef', '#bcaaa4'] },
  { id: 'porcelain', name: 'Porcelain', colors: ['#f8fafc', '#64748b'] },
  { id: 'lace', name: 'Lace', colors: ['#fdfbf7', '#d6d3d1'] },
  { id: 'daisy', name: 'Daisy', colors: ['#fffff0', '#eab308'] },
];

const FONTS = [
  { id: 'inter', name: 'Inter' },
  { id: 'roboto', name: 'Roboto' },
  { id: 'opensans', name: 'Open Sans' },
  { id: 'lato', name: 'Lato' },
  { id: 'montserrat', name: 'Montserrat' },
  { id: 'poppins', name: 'Poppins' },
  { id: 'raleway', name: 'Raleway' },
  { id: 'nunito', name: 'Nunito' },
  { id: 'ubuntu', name: 'Ubuntu' },
  { id: 'playfair', name: 'Playfair Display' },
  { id: 'lora', name: 'Lora' },
  { id: 'ptserif', name: 'PT Serif' },
  { id: 'robotoslab', name: 'Roboto Slab' },
  { id: 'quicksand', name: 'Quicksand' },
  { id: 'inconsolata', name: 'Inconsolata' },
  { id: 'oswald', name: 'Oswald' },
  { id: 'pacifico', name: 'Pacifico' },
  { id: 'dancing', name: 'Dancing Script' },
  { id: 'vt323', name: 'VT323' },
  { id: 'pressstart', name: 'Press Start 2P' },
  { id: 'merriweather', name: 'Merriweather' },
  { id: 'indie-flower', name: 'Indie Flower' },
  { id: 'fira-code', name: 'Fira Code' },
  { id: 'system', name: 'System UI' },
];

const ThemeCard = ({ name, value, colors, current, onClick }) => {
  const isSelected = current === value;
  return (
    <div
      onClick={() => onClick(value)}
      style={{
        border: isSelected
          ? '2px solid var(--primary)'
          : '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '0.8rem',
        cursor: 'pointer',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s',
        opacity: isSelected ? 1 : 0.7,
      }}>
      <div className='theme-preview-colors'>
        <div className='theme-preview-dot' style={{ background: colors[0] }} />
        <div className='theme-preview-dot' style={{ background: colors[1] }} />
      </div>
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: isSelected ? 600 : 400,
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
        {name}
      </span>
    </div>
  );
};

const FontCard = ({ name, value, current, onClick }) => {
  const isSelected = current === value;
  // Apply font family directly to preview
  let fontFamily = 'inherit';
  switch (value) {
    case 'inter':
      fontFamily = "'Inter', sans-serif";
      break;
    case 'roboto':
      fontFamily = "'Roboto', sans-serif";
      break;
    case 'opensans':
      fontFamily = "'Open Sans', sans-serif";
      break;
    case 'lato':
      fontFamily = "'Lato', sans-serif";
      break;
    case 'montserrat':
      fontFamily = "'Montserrat', sans-serif";
      break;
    case 'poppins':
      fontFamily = "'Poppins', sans-serif";
      break;
    case 'raleway':
      fontFamily = "'Raleway', sans-serif";
      break;
    case 'nunito':
      fontFamily = "'Nunito', sans-serif";
      break;
    case 'ubuntu':
      fontFamily = "'Ubuntu', sans-serif";
      break;
    case 'playfair':
      fontFamily = "'Playfair Display', serif";
      break;
    case 'lora':
      fontFamily = "'Lora', serif";
      break;
    case 'ptserif':
      fontFamily = "'PT Serif', serif";
      break;
    case 'robotoslab':
      fontFamily = "'Roboto Slab', serif";
      break;
    case 'quicksand':
      fontFamily = "'Quicksand', sans-serif";
      break;
    case 'inconsolata':
      fontFamily = "'Inconsolata', monospace";
      break;
    case 'oswald':
      fontFamily = "'Oswald', sans-serif";
      break;
    case 'pacifico':
      fontFamily = "'Pacifico', cursive";
      break;
    case 'dancing':
      fontFamily = "'Dancing Script', cursive";
      break;
    case 'vt323':
      fontFamily = "'VT323', monospace";
      break;
    case 'pressstart':
      fontFamily = "'Press Start 2P', cursive";
      break;
    case 'merriweather':
      fontFamily = "'Merriweather', serif";
      break;
    case 'indie-flower':
      fontFamily = "'Indie Flower', cursive";
      break;
    case 'fira-code':
      fontFamily = "'Fira Code', monospace";
      break;
    case 'system':
      fontFamily = 'system-ui, -apple-system, sans-serif';
      break;
  }

  return (
    <div
      onClick={() => onClick(value)}
      style={{
        border: isSelected
          ? '2px solid var(--primary)'
          : '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '0.8rem',
        cursor: 'pointer',
        background: 'var(--bg-surface)',
        textAlign: 'center',
        transition: 'all 0.2s',
        opacity: isSelected ? 1 : 0.7,
      }}>
      <span style={{ fontSize: '1rem', fontFamily: fontFamily }}>Aa</span>
      <div
        style={{
          fontSize: '0.8rem',
          marginTop: '0.2rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: fontFamily,
        }}>
        {name}
      </div>
    </div>
  );
};

const SettingsItem = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  isActive,
  isToggle = true,
  customAction,
  showChevron = false,
  className = '',
}) => {
  return (
    <div
      className={`feature-item ${className}`}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        height: '100%',
      }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className='feature-icon' style={{ flexShrink: 0 }}>
          <Icon size={20} color='var(--text-main)' />
        </div>
        <div className='feature-text' style={{ textAlign: 'left' }}>
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
            }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {customAction ? (
        customAction
      ) : isToggle ? (
        <div className={`toggle-switch ${isActive ? 'active' : ''}`}>
          <div className='toggle-thumb' />
        </div>
      ) : (
        showChevron && <ChevronRight size={18} color='var(--text-muted)' />
      )}
    </div>
  );
};

const Settings = () => {
  const { theme, font, changeTheme, changeFont } = useTheme();
  const { userId, logout } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const addToast = useToast();
  const navigate = useNavigate();

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    addToast('User ID copied to clipboard.', 'success');
  };

  return (
    <div className='centered-page-container full-width'>
      <div
        className='chat-page-wrapper active'
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          overflowY: 'auto',
          padding: '2rem',
        }}>
        <div className='intro-section'>
          <h1 className='chat-page-title'>Settings</h1>
          <p className='chat-page-subtitle'>Customize your anonymity.</p>
        </div>

        <div className='settings-grid'>
          {/* Account Info - Full Width */}
          <div
            className='feature-item full-span'
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'var(--primary)',
              display: 'block',
            }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}>
                YOUR SECRET ID
              </span>
              <button onClick={handleCopyId}>
                <Copy size={16} color='var(--primary)' />
              </button>
            </div>
            <code
              style={{
                display: 'block',
                wordBreak: 'break-all',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
              }}>
              {userId}
            </code>
          </div>

          {/* Appearance Section */}
          <h3
            className='full-span'
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-dim)',
              marginTop: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
            Appearance
          </h3>

          <div
            className='full-span'
            style={{
              background: 'var(--input-bg)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
            }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.8rem',
              }}>
              <Moon size={16} color='var(--primary)' />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dark Themes</p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.8rem',
                marginBottom: '1.5rem',
              }}>
              {DARK_THEMES.map((t) => (
                <ThemeCard
                  key={t.id}
                  name={t.name}
                  value={t.id}
                  colors={t.colors}
                  current={theme}
                  onClick={changeTheme}
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.8rem',
              }}>
              <Sun size={16} color='var(--primary)' />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Light Themes
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.8rem',
              }}>
              {LIGHT_THEMES.map((t) => (
                <ThemeCard
                  key={t.id}
                  name={t.name}
                  value={t.id}
                  colors={t.colors}
                  current={theme}
                  onClick={changeTheme}
                />
              ))}
            </div>
          </div>

          <div
            className='full-span'
            style={{
              background: 'var(--input-bg)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
            }}>
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.8rem',
              }}>
              Typography
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.8rem',
              }}>
              {FONTS.map((f) => (
                <FontCard
                  key={f.id}
                  name={f.name}
                  value={f.id}
                  current={font}
                  onClick={changeFont}
                />
              ))}
            </div>
          </div>

          {/* Accessibility & Preferences */}
          <h3
            className='full-span'
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-dim)',
              marginTop: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
            Preferences
          </h3>

          <SettingsItem
            icon={Bell}
            title='Notifications'
            subtitle='Alerts for replies'
            isActive={notifications}
            onClick={() => setNotifications(!notifications)}
          />

          <SettingsItem
            icon={Eye}
            title='Reduce Motion'
            subtitle='Minimize animations'
            isActive={reduceMotion}
            onClick={() => setReduceMotion(!reduceMotion)}
          />

          {/* Info Section */}
          <h3
            className='full-span'
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-dim)',
              marginTop: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
            Information
          </h3>

          <SettingsItem
            icon={BookOpen}
            title='Community Rules'
            subtitle='Guidelines'
            isToggle={false}
            showChevron={true}
            onClick={() => navigate('/rules')}
          />
          <SettingsItem
            icon={Info}
            title='About AnonSpace'
            subtitle='Project info'
            isToggle={false}
            showChevron={true}
            onClick={() => navigate('/about')}
          />

          <SettingsItem
            className='full-span'
            icon={LogOut}
            title='Log Out'
            subtitle='Removes ID from device'
            isToggle={false}
            onClick={logout}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
